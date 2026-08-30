import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

const questions = [
  {
    questionText: "What is the primary purpose of a Security Operations Centre (SOC)?",
    options: ["To develop mobile applications", "To monitor, detect, investigate, and respond to security threats", "To manage employee salaries", "To design websites"],
    correctOptionIndex: 1
  },
  {
    questionText: "Why do enterprises need a SOC?",
    options: ["To reduce the number of employees", "To manage office infrastructure", "To handle huge volumes of security events and increasing cyber threats", "To develop business applications"],
    correctOptionIndex: 2
  },
  {
    questionText: "Which of the following is a key challenge addressed by a SOC?",
    options: ["Manual monitoring of large amounts of security data", "Graphic designing", "Software licensing", "Employee recruitment"],
    correctOptionIndex: 0
  },
  {
    questionText: "What does 24x7 attack opportunities indicate?",
    options: ["Attackers can only operate during office hours", "Organizations may face attacks at any time", "Attacks happen only once a day", "Security monitoring is unnecessary at night"],
    correctOptionIndex: 1
  },
  {
    questionText: "Which environment is specifically mentioned as increasing the need for SOC capabilities?",
    options: ["Cloud and remote environments", "Only physical servers", "Standalone computers", "Offline systems"],
    correctOptionIndex: 0
  },
  {
    questionText: "Which of the following can provide security data to a SOC?",
    options: ["Endpoints", "Network devices", "Security devices", "All of the above"],
    correctOptionIndex: 3
  },
  {
    questionText: "What is the SOC role progression mentioned in the presentation?",
    options: ["L3 -> L2 -> L1", "L1 -> L2 -> L3", "L2 -> L1 -> L3", "L1 -> L3 -> L2"],
    correctOptionIndex: 1
  },
  {
    questionText: "As SOC alert complexity increases, what happens?",
    options: ["Alerts are ignored", "Alerts are escalated", "Alerts are deleted", "Monitoring stops"],
    correctOptionIndex: 1
  },
  {
    questionText: "Which SOC level generally handles more complex security investigations?",
    options: ["L1", "L2", "L3", "Help Desk"],
    correctOptionIndex: 2
  },
  {
    questionText: "The SOC incident lifecycle is best described as:",
    options: ["A one-time process", "A continuous cycle", "A software development process", "A network installation process"],
    correctOptionIndex: 1
  },
  {
    questionText: "Why is the SOC incident lifecycle considered continuous?",
    options: ["Every closed incident can improve future detection", "Incidents are never closed", "Analysts never investigate alerts", "Security tools are replaced every day"],
    correctOptionIndex: 0
  },
  {
    questionText: "What is the first stage of getting security data into Microsoft Sentinel?",
    options: ["Investigation", "Collection", "Response", "Reporting"],
    correctOptionIndex: 1
  },
  {
    questionText: "What is the purpose of the collection stage?",
    options: ["To collect security data from relevant sources", "To delete security logs", "To close incidents", "To create employee accounts"],
    correctOptionIndex: 0
  },
  {
    questionText: "What is meant by “From Raw Logs to Usable Security Data”?",
    options: ["Raw logs are transformed into useful security information", "Logs are permanently deleted", "Only application logs are collected", "Security data is converted into financial data"],
    correctOptionIndex: 0
  },
  {
    questionText: "What is the main difference between Detection and Threat Hunting?",
    options: ["Detection is alert-driven, while threat hunting is hypothesis-driven", "Detection is hypothesis-driven, while threat hunting is alert-driven", "Both are exactly the same", "Neither uses security data"],
    correctOptionIndex: 0
  },
  {
    questionText: "Threat hunting is primarily:",
    options: ["Alert-driven", "Hypothesis-driven", "Password-driven", "Compliance-driven only"],
    correctOptionIndex: 1
  },
  {
    questionText: "Detection is primarily:",
    options: ["Hypothesis-driven", "Alert-driven", "Employee-driven", "Budget-driven"],
    correctOptionIndex: 1
  },
  {
    questionText: "Which stage focuses on investigating an alert and building the attack story?",
    options: ["Collection", "Detection", "Investigation", "Reporting"],
    correctOptionIndex: 2
  },
  {
    questionText: "What is the objective of alert investigation?",
    options: ["Build the attack story", "Delete all alerts", "Disable security tools", "Replace network devices"],
    correctOptionIndex: 0
  },
  {
    questionText: "What does alert validation involve?",
    options: ["Determining whether an alert represents a genuine security concern", "Creating a new operating system", "Installing office software", "Removing all security logs"],
    correctOptionIndex: 0
  },
  {
    questionText: "Which stage focuses on containing and remediating security incidents?",
    options: ["Collection", "Detection", "Investigation", "Response"],
    correctOptionIndex: 3
  },
  {
    questionText: "Which of the following is included in the Response stage?",
    options: ["Contain", "Remediate", "Automate", "All of the above"],
    correctOptionIndex: 3
  },
  {
    questionText: "What is the final stage of the SOC lifecycle presented in the PDF?",
    options: ["Detection", "Investigation", "Reporting", "Collection"],
    correctOptionIndex: 2
  },
  {
    questionText: "Which activities are associated with the Reporting stage?",
    options: ["Documentation", "Reporting", "Lessons learned", "All of the above"],
    correctOptionIndex: 3
  },
  {
    questionText: "Why are lessons learned important after an incident?",
    options: ["They can help improve future detection and response", "They eliminate the need for security monitoring", "They prevent analysts from investigating alerts", "They replace all security devices"],
    correctOptionIndex: 0
  }
];

async function seed() {
  try {
    console.log('Clearing old questions...');
    await sql`DELETE FROM exam_questions`;
    
    let order = 0;
    for (const q of questions) {
      const id = 'eq_' + Date.now().toString() + '_' + Math.random().toString(36).substring(2,7);
      
      await sql`
        INSERT INTO exam_questions (id, question_text, options, correct_option_index, order_index)
        VALUES (${id}, ${q.questionText}, ${JSON.stringify(q.options)}::jsonb, ${q.correctOptionIndex}, ${order})
      `;
      order++;
      console.log(`Inserted question ${order}/25`);
    }
    
    console.log('Successfully seeded all 25 questions from the PDF!');
  } catch (err) {
    console.error('Failed to seed:', err);
  }
}

seed();
