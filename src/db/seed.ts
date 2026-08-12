import { db } from './index';
import { eventSettings, users, schedules, announcements } from './schema';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('--- Seeding NEXTGEN SOC Database ---');

  // 1. Seed Event Settings if not present
  const existingSettings = await db.select().from(eventSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(eventSettings).values({
      id: 'settings_default',
      eventName: 'NEXTGEN SOC',
      tagline: 'Detect. Defend. Respond.',
      dates: 'August 22 - 23, 2026',
      venue: 'Main Cyber Range Auditorium & SOC Lab 4',
      registrationFeeUe: 300,
      registrationFeeOther: 450,
      totalCapacity: 500,
      ueCapacity: 200,
      peopleCapacity: 300,
      registrationOpen: true,
      paymentUpiId: 'nextgensoc.dept@upi',
      paymentQrUrl: '/assets/soc_upi_qr.png',
      contactPhone: '+91 98765 43210',
      contactEmail: 'soc-support@nextgensoc.io',
      termsVersion: 'v1.0',
    });
    console.log('✓ Default Event Settings seeded');
  }

  // 2. Seed Master Admin User
  const adminEmail = 'admin@nextgensoc.io';
  const existingAdmin = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
  if (existingAdmin.length === 0) {
    await db.insert(users).values({
      id: 'usr_admin_master',
      googleId: 'google_admin_master',
      email: adminEmail,
      name: 'SOC Lead Commander',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
    });
    console.log('✓ Master Admin user seeded');
  }

  // 3. Seed Default 2-Day SOC Bootcamp Schedule
  const existingSchedules = await db.select().from(schedules).limit(1);
  if (existingSchedules.length === 0) {
    await db.insert(schedules).values([
      {
        id: 'sch_day1_1',
        day: 1,
        startTime: '09:00 AM',
        endTime: '10:30 AM',
        title: 'SOC Fundamentals & Cyber Threat Landscape',
        description: 'Evolution of SOC operations, SIEM architectures, MITRE ATT&CK framework mapping, and modern adversary tactics.',
        speaker: 'Dr. Evelyn Vance (Chief Information Security Officer)',
        orderIndex: 1,
      },
      {
        id: 'sch_day1_2',
        day: 1,
        startTime: '10:45 AM',
        endTime: '01:00 PM',
        title: 'Hands-on SIEM Telemetry & Log Ingestion Lab',
        description: 'Configuring syslog forwarding, Windows Event Forwarding, parsing Sysmon telemetry, and building real-time alert rules.',
        speaker: 'Marcus Thorne (Lead Security Architect)',
        orderIndex: 2,
      },
      {
        id: 'sch_day1_3',
        day: 1,
        startTime: '02:00 PM',
        endTime: '05:00 PM',
        title: 'Live Network Anomaly Detection & Packet Analysis',
        description: 'Wireshark deep packet inspection, Zeek network telemetry, detecting C2 beacons, DNS exfiltration, and lateral movement.',
        speaker: 'Sarah Jenkins (Senior DFIR Specialist)',
        orderIndex: 3,
      },
      {
        id: 'sch_day2_1',
        day: 2,
        startTime: '09:00 AM',
        endTime: '12:30 PM',
        title: 'EDR Forensics & Memory Threat Hunting',
        description: 'Memory analysis with Volatility, live process triage, process injection detection, and reverse engineering malicious payloads.',
        speaker: 'Alex Rivera (Malware Analyst & Reverse Engineer)',
        orderIndex: 4,
      },
      {
        id: 'sch_day2_2',
        day: 2,
        startTime: '01:30 PM',
        endTime: '04:30 PM',
        title: 'Simulated SOC War Room: Live Cyber Attack Range',
        description: 'Full-scale simulated enterprise ransomware incident. Teams investigate alerts, contain threats, and present triage reports.',
        speaker: 'SOC Range Operations Team',
        orderIndex: 5,
      },
      {
        id: 'sch_day2_3',
        day: 2,
        startTime: '04:30 PM',
        endTime: '05:30 PM',
        title: 'Debrief, Certification & SOC Career Pathways',
        description: 'Analysis of range performance, tier-1/tier-2 SOC analyst job readiness, and certificate award ceremony.',
        speaker: 'Organizing Committee',
        orderIndex: 6,
      },
    ]);
    console.log('✓ 2-Day SOC Bootcamp Schedule seeded');
  }

  // 4. Seed Welcome Announcement
  const existingAnnouncements = await db.select().from(announcements).limit(1);
  if (existingAnnouncements.length === 0) {
    await db.insert(announcements).values({
      id: 'ann_welcome',
      title: 'Welcome to NEXTGEN SOC Analyst Bootcamp 2026',
      content: 'Registration is officially live! Please complete your academic details, submit your UPI fee receipt with UTR, and check your participant portal for real-time verification updates.',
      priority: 'important',
      audience: 'all',
      published: true,
      createdBy: 'usr_admin_master',
    });
    console.log('✓ Welcome Announcement seeded');
  }

  console.log('--- Seeding Completed Successfully ---');
}

// Allow direct execution
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
