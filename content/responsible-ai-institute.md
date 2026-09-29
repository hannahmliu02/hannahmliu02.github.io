---
title: "Responsible AI Institute"
slug: responsible-ai-institute
layout: rai
eyebrow: Responsible AI Institute
headline: Turning governance research into <em>working frameworks</em>
intro: As a **Research Engineer in AI Policy and Governance** at the Responsible AI Institute (RAI), I build the theoretical and technical foundations for practical AI governance mechanisms. Recent projects include developing a risk classification framework for agentic AI, creating a policy-to-control mapping system, and establishing the foundations of an open source AI registry.

ledger:
  - { k: Role, v: Research Engineer in AI Policy and Governance }
  - { k: Since, v: January 2026 }
  - { k: Work, v: "ARC, TrustX, ROAR" }
  - { k: Leading, v: The upcoming RAI Fellowship }

# The framework graph and the spotlight columns use these ids (/responsible-ai-institute/#arc and so on).
projects:
  - id: arc
    step: ARC · Risk classification
    title: TrustX Agent Risk Classification (ARC)
    fields: [law, pol, comp]
    text: ARC is a structured, iterable framework that provides risk classification for 7 agentic AI system types. It is grounded in established frameworks, such as the NIST AI RMF, the EU AI Act, ISO/IEC 42001, OWASP, MITRE ATLAS, and SR 11-7/26-2. Its outputs will then inform mapped control recommendations in RAI's policy generator tool.
    link: { label: Working paper (PDF), url: /uploads/arc_working.pdf }
    chips: [7 system types, 12 risk dimensions]
  - id: trustx
    step: TrustX · Builds off ARC
    title: TrustX Expanded Risk Framework
    fields: [econ, law, pol]
    text: The expanded framework builds off of ARC by including procurement risk and exposure risk to legacy systems. It maintains the 12-risk dimension core introduced in ARC and tailors the risk classification to each risk surface with additional components, such as a procurement dossier or an agentic threat testing layer.
    link: { label: Working paper (PDF), url: /uploads/trustx_expanded_working.pdf }
    chips: [Procurement risk, Legacy exposure]
  - id: roar
    step: ROAR · Maps to TrustX
    title: RAI Open AI Registry (ROAR)
    fields: [pol, comp, econ]
    text: A component of our launch of the TrustX for Finance Working Group was the introduction of ROAR, which allows individuals to contribute to an open source platform that shows how their AI applications map to our TrustX risk framework. This is a part of RAI's goals to create a collective core of iterative feedback within the AI governance community.
    link: { label: "Sneak peek on the working group's site", url: "https://www.responsible.ai/trustx-finance/" }
    chips: [Open source, TrustX for Finance]

fellowship: I'm leading the upcoming RAI Fellowship programme, which will mentor young graduates looking to break into the AI governance space.

talks:
  - kicker: London Tech Week 2026 · Panel
    title: "Ensuring Growing AI Use Isn't Increasing Security Risk"
    text: Discussed the fluid yet nuanced definition of AI risk, the risks of shadow AI, how to manage risk at scale, and future steps towards effective AI governance.
    photos:
      - { src: /uploads/ltw1.jpg, alt: Speaking on the London Tech Week 2026 panel }
      - { src: /uploads/ltw2.jpg, alt: Speaking on the London Tech Week 2026 panel }
  - kicker: AI Summit London 2026 · Partner-led meetup
    title: "Why 95% of Enterprise AI Projects Fail: The missing governance step that unlocks ROI"
    text: "Facilitated a discussion about the real pain points organisations face with AI governance and how the Responsible AI Institute's TrustX framework and member community provide solutions and avenues for collaboration."
    link: { label: Slide deck (PDF), url: /uploads/rai_networking_deck.pdf }
    photos:
      - { src: /uploads/ai_summit.jpg, alt: Speaking at the AI Summit London }

newsletter:
  intro: "Every month, I write on AI policy and governance developments with the Practising Lawyer's Institute."
  issues:
    - { num: "06", month: June 2026, title: "Move Fast, Responsibly: Takeaways and Insights from London Tech Week", url: "https://bit.ly/4vGLKyS", fmt: Link }
    - { num: "05", month: May 2026, title: "Beyond Internal Controls: Expanding AI Risk Assessments into Procurement and Exposure Dimensions", url: /uploads/pli_may.pdf, fmt: PDF }
    - { num: "04", month: April 2026, title: "Analysing the Potential Risks of Procuring Off-the-Shelf Models in Financial Services Use Cases", url: /uploads/pli_april.pdf, fmt: PDF }
---
