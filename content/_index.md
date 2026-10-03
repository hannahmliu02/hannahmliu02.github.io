---
title: Hannah Liu

# ── Top of the homepage ─────────────────────────────────────────────────────
# Your name and photo come first, then the role line, tagline and synopsis.
name: Hannah Liu                    # shown as the big heading
photo: media/authors/me.png         # a file inside assets/ (swap the image there to change it)
role: AI Governance Researcher      # small line above your name
# Synopsis: write it in Markdown. Leave a blank line between paragraphs.
# The first paragraph is shown larger; later paragraphs are smaller and grey.
synopsis: |
  I study how AI should be governed, working where the disciplines meet.

  My research looks at governance frameworks that are decentralised, ethically sound and globally applicable, and at how AI can enter society without harming underrepresented people. At the Responsible AI Institute, I turn that thinking into practical tools, like risk frameworks for agentic AI and an open registry of AI applications.

# Research areas (gold nodes) and Responsible AI Institute projects (navy diamonds).
# `fields` use the ids in config/_default/params.yaml.
# `mentions` are the places on the site each one comes up. The graph and the lists link to them.
areas:
  # ── Research areas ────────────────────────────────────────────────────────
  - id: decentralised-ai-governance
    kind: topic
    name: Decentralised AI governance
    fields: [phil, pol]
    blurb: Frameworks that hold up across countries and cultures, without a single central authority.
    mentions:
      - { label: My research focus, url: /about/#bio }
      - { label: ROAR, an open AI registry, url: /responsible-ai-institute/#roar }
      - { label: Research engineer at RAI, url: /what-ive-been-up-to/#rai }

  - id: fairness-for-underrepresented-groups
    kind: topic
    name: Fairness for underrepresented groups
    fields: [phil, psych, pol]
    blurb: How AI systems can serve people who are usually missing from training data and policy rooms.
    mentions:
      - { label: My research focus, url: /about/#bio }
      - { label: Bias in clinical prediction models, url: /what-ive-been-up-to/#clinical-prediction }
      - { label: Bias in LLM image generation, url: /what-ive-been-up-to/#image-generation }

  - id: human-and-machine-cognition
    kind: topic
    name: Human and machine cognition
    fields: [cog, neuro, comp]
    blurb: Using what we know about minds to ask better questions about models.
    mentions:
      - { label: BA in Cognitive Science, url: /about/#education }
      - { label: Traits of successful forecasters, url: /what-ive-been-up-to/#forecasters }

  - id: measuring-model-bias
    kind: topic
    name: Measuring model bias
    fields: [comp, psych]
    blurb: Evaluating bias both in what models say and in how they represent people internally.
    mentions:
      - { label: "Dissertation: fine-tuning and bias guardrails", url: /what-ive-been-up-to/#bias-guardrails }
      - { label: Visiting researcher at Cambridge, url: /what-ive-been-up-to/#cambridge }
      - { label: Bias in LLM image generation, url: /what-ive-been-up-to/#image-generation }
      - { label: Bias in clinical prediction models, url: /what-ive-been-up-to/#clinical-prediction }

  - id: fine-tuning-and-guardrails
    kind: topic
    name: Fine-tuning and safety guardrails
    fields: [comp, pol]
    blurb: How much fine-tuning it takes to wear down the guardrails built into language models.
    mentions:
      - { label: "Dissertation: fine-tuning and bias guardrails", url: /what-ive-been-up-to/#bias-guardrails }
      - { label: Visiting researcher at Cambridge, url: /what-ive-been-up-to/#cambridge }

  - id: causal-inference
    kind: topic
    name: Causal inference and RLHF
    fields: [comp, phil]
    blurb: Using causal methods to find where bias comes from and correct it, including a causal RLHF pipeline.
    mentions:
      - { label: Bias in clinical prediction models, url: /what-ive-been-up-to/#clinical-prediction }
      - { label: Academic interests, url: /about/#interests }

  - id: ai-in-healthcare
    kind: topic
    name: AI in healthcare
    fields: [comp, neuro, pol]
    blurb: Clinical models that help without creating feedback loops that harm patients.
    mentions:
      - { label: Bias in clinical prediction models, url: /what-ive-been-up-to/#clinical-prediction }
      - { label: Predicting dyspnea with machine learning, url: /what-ive-been-up-to/#dyspnea }

  - id: forecasting-and-judgement
    kind: topic
    name: Forecasting and human judgement
    fields: [psych, cog]
    blurb: What makes some people better at predicting the future, and what that says about judgement.
    mentions:
      - { label: Traits of successful forecasters, url: /what-ive-been-up-to/#forecasters }

  # ── Responsible AI Institute projects ────────────────────────────────────
  - id: arc
    kind: project
    name: ARC
    kicker: TrustX Agent Risk Classification
    fields: [pol, comp]
    blurb: Risk classification for seven types of agentic AI system, grounded in the NIST AI RMF, the EU AI Act and ISO/IEC 42001.
    mentions:
      - { label: ARC on the RAI page, url: /responsible-ai-institute/#arc }
      - { label: Research engineer at RAI, url: /what-ive-been-up-to/#rai }

  - id: trustx
    kind: project
    name: TrustX
    kicker: Expanded risk framework
    fields: [pol, phil]
    blurb: Extends ARC to procurement risk and exposure to legacy systems, with a procurement dossier for each risk surface.
    mentions:
      - { label: TrustX on the RAI page, url: /responsible-ai-institute/#trustx }
      - { label: "Newsletter: procurement and exposure risk", url: /responsible-ai-institute/#newsletter }

  - id: roar
    kind: project
    name: ROAR
    kicker: RAI Open AI Registry
    fields: [pol, comp, psych]
    blurb: An open-source registry where people map their AI applications to the TrustX risk framework.
    mentions:
      - { label: ROAR on the RAI page, url: /responsible-ai-institute/#roar }

  - id: policy-generator
    kind: project
    name: Policy generator
    kicker: Policy-to-control mapping
    fields: [pol, comp]
    blurb: Turns ARC's risk classifications into mapped control recommendations for organisations.
    mentions:
      - { label: How ARC feeds the policy generator, url: /responsible-ai-institute/#arc }
      - { label: Research engineer at RAI, url: /what-ive-been-up-to/#rai }

  - id: fellowship
    kind: project
    name: Fellowship
    kicker: RAI Fellowship
    fields: [pol, psych]
    blurb: A programme I'm leading to mentor young graduates breaking into AI governance.
    mentions:
      - { label: The fellowship on the RAI page, url: /responsible-ai-institute/#fellowship }

  - id: newsletter
    kind: project
    name: Newsletter
    kicker: Policy & Insights
    fields: [pol, phil]
    blurb: A monthly newsletter on AI policy and governance, written with the Practising Lawyer's Institute.
    mentions:
      - { label: All issues, url: /responsible-ai-institute/#newsletter }
---
