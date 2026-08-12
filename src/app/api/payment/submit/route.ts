import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, registrations, eventSettings } from '@/db/schema';
import { paymentSubmissionSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { analyzePaymentScreenshot } from '@/lib/ocr';
import { broadcastRealtimeEvent } from '@/lib/realtime';
import { eq } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = paymentSubmissionSchema.parse(body);

    // 1. Fetch user registration
    const userRegs = await db
      .select()
      .from(registrations)
      .where(eq(registrations.registrationId, validatedData.registrationId))
      .limit(1);

    if (userRegs.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Registration record not found.' },
        { status: 404 }
      );
    }

    const registration = userRegs[0];

    // Ensure the submitting user owns this registration
    const isOwner =
      registration.userId === user.id ||
      (registration.email && user.email && registration.email.toLowerCase() === user.email.toLowerCase());

    if (!isOwner && user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to submit payment for this registration.' },
        { status: 403 }
      );
    }

    // 2. Check for Duplicate UTR in DB
    const existingUtr = await db
      .select()
      .from(payments)
      .where(eq(payments.utr, validatedData.utr.trim().toUpperCase()))
      .limit(1);

    if (existingUtr.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'This UTR / Transaction Reference ID has already been submitted in another payment.',
        },
        { status: 409 }
      );
    }

    // 3. Check if this registration already has a payment
    const existingPayment = await db
      .select()
      .from(payments)
      .where(eq(payments.registrationId, registration.id))
      .limit(1);

    if (existingPayment.length > 0 && existingPayment[0].status === 'verified') {
      return NextResponse.json(
        { success: false, error: 'This registration already has a verified payment.' },
        { status: 400 }
      );
    }

    // 4. Calculate Expected Fee based on Credit Type
    const settings = (await db.select().from(eventSettings).limit(1))[0] || {
      registrationFee: 300,
    };
    const expectedAmount = (settings as any).registrationFee || 300;

    // 5. Run Fast OCR Analysis using external free API
    const ocrResult = await analyzePaymentScreenshot(
      validatedData.screenshotUrl,
      validatedData.utr.trim().toUpperCase(),
      validatedData.amount
    );

    // 6. Insert or Update Payment Record
    const paymentId = existingPayment.length > 0 ? existingPayment[0].id : `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    if (existingPayment.length > 0) {
      await db
        .update(payments)
        .set({
          utr: validatedData.utr.trim().toUpperCase(),
          amount: validatedData.amount,
          expectedAmount,
          screenshotUrl: validatedData.screenshotUrl,
          ocrUtr: ocrResult.ocrUtr,
          ocrAmount: ocrResult.ocrAmount,
          ocrDate: ocrResult.ocrDate,
          ocrConfidence: ocrResult.ocrConfidence,
          status: 'pending',
          rejectionReason: null,
          submittedAt: new Date(),
        })
        .where(eq(payments.id, paymentId));
    } else {
      await db.insert(payments).values({
        id: paymentId,
        registrationId: registration.id,
        userId: registration.userId,
        utr: validatedData.utr.trim().toUpperCase(),
        amount: validatedData.amount,
        expectedAmount,
        screenshotUrl: validatedData.screenshotUrl,
        ocrUtr: ocrResult.ocrUtr,
        ocrAmount: ocrResult.ocrAmount,
        ocrDate: ocrResult.ocrDate,
        ocrConfidence: ocrResult.ocrConfidence,
        status: 'pending',
        submittedAt: new Date(),
      });
    }

    // 7. Emit Realtime event for Admin dashboard
    broadcastRealtimeEvent('payment:statusUpdated', {
      paymentId,
      registrationId: registration.registrationId,
      userId: user.id,
      participantName: registration.name,
      status: 'pending',
    });

    return NextResponse.json({
      success: true,
      status: 'pending',
      ocrAnalysis: {
        extractedUtr: ocrResult.ocrUtr,
        extractedAmount: ocrResult.ocrAmount,
        confidence: ocrResult.ocrConfidence,
        utrMatch: ocrResult.matchedFields.utrMatched,
        amountMatch: ocrResult.matchedFields.amountMatched,
      },
    });
  } catch (error: any) {
    console.error('Payment submit error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to submit payment details.' },
      { status: 500 }
    );
  }
}
