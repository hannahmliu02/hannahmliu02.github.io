---
title: "What I've Been Up To"
slug: what-ive-been-up-to
layout: experience
eyebrow: Roles and projects
intro: My current roles and past research projects. Each one draws on a few of the fields I work across. Pick a field to see where it shows up.

# Each entry gets its own link (/what-ive-been-up-to/#id), which the homepage graph uses.
# `kind: applied` draws a navy diamond (RAI work); anything else is a gold research node.
# `fields` use the ids in config/_default/params.yaml. `related` uses the area ids in content/_index.md.
groups:
  - title: Current roles
    entries:
      - id: cambridge
        title: "Visiting Master's Researcher"
        org: University of Cambridge
        dates: Oct 2025 to present
        text: Analysing the effects of fine-tuning methodologies on AI bias guardrails in LLMs, in collaboration with **Noah Broestl**, under the supervision of **Dr. Umang Bhatt**.
        fields: [comp, phil]
        related: [measuring-model-bias]

      - id: rai
        kind: applied
        title: Research Engineer in AI Policy and Governance
        org: Responsible AI Institute
        dates: Jan 2026 to present
        text: Building the theoretical and technical foundations for AI governance mechanisms, such as a risk classification and policy generation framework for agentic AI systems. [More on the RAI page.](/responsible-ai-institute/)
        fields: [pol, comp]
        related: [arc, trustx, roar, decentralised-ai-governance]

  - title: Research projects
    note: Newest first.
    entries:
      - id: bias-guardrails
        title: Analysing the Effects of Fine-Tuning Methodologies on AI Bias Guardrails in LLMs
        org: "Master's dissertation · TRACE Lab, Cambridge"
        dates: May 2026 to present
        text: Testing the effectiveness of LoRA and OFT on eroding pre-programmed AI bias guardrails in LLMs. Aiming to develop a practical recommendation and theorem that industry and academic stakeholders can use to determine how much fine-tuning data they need to eliminate bias guardrails in their specific use case. In collaboration with the TRACE Lab at the University of Cambridge.
        fields: [comp, phil, pol]
        related: [measuring-model-bias]

      - id: clinical-prediction
        title: Developing Bias Identification and Mitigation Techniques for Clinical Prediction Models (CPMs)
        org: "Imperial College London · ELEC70122: ML for Safety Critical Decision-Making"
        dates: Jan 2026 to Mar 2026
        text: Devised bias identification methods that showed CPMs can learn to use missing data as a predictive signal and contribute to undesirable feedback loops in clinical settings. Introduced an uncertainty-triggered measurement intervention and a causal RLHF pipeline as bias mitigation methods for this use case.
        links:
          - { label: "Coursework paper (NeurIPS format, per the coursework brief)", url: /uploads/bias_in_cpms.pdf }
        fields: [comp, phil, pol]
        related: [measuring-model-bias, fairness-for-underrepresented-groups]

      - id: image-generation
        title: Investigating the Presence of Bias and Potential Copyright Concerns in LLM Image Generation Capabilities
        org: Penn HCI Lab
        dates: Aug 2024 to Feb 2026
        text: Used quantitative and qualitative sociotechnical evaluation methods to investigate racial bias, gender bias, and potential copyright concerns in LLM-generated movie posters.
        links:
          - { label: "Poster and oral presentation, Penn NRCP 2025", url: /uploads/nrcp.pdf }
          - { label: Work-in-progress manuscript, url: /uploads/chi2026.pdf }
        fields: [comp, psych]
        related: [measuring-model-bias, fairness-for-underrepresented-groups]

      - id: forecasters
        title: Utilising Correlational Analysis to Identify Traits of Successful Forecasters
        org: Penn Psychology Department
        dates: May 2023 to Sep 2023
        text: Applied correlational analysis to identify the traits and behaviours most associated with successful forecasters in a forecasting tournament.
        links:
          - { label: "Poster presentation, CURF Research Expo 2023", url: /uploads/hpt.pdf }
        fields: [psych, cog]
        related: [human-and-machine-cognition]

      - id: dyspnea
        title: "Comparing Predictive Machine Learning Models' Capacity to Objectively Predict Dyspnea"
        org: Penn Medicine
        dates: May 2022 to May 2023
        text: Developed predictive ML models that automatically and accurately estimated a patient's breathing exertion levels, allowing doctors to monitor patients with respiratory illness without using physically invasive methods.
        links:
          - { label: "Poster presentation, BMES 2023 Annual Meeting", url: /uploads/bmes.pdf }
        fields: [comp, neuro]
        related: []

skills:
  - title: Technical
    items:
      - { name: Python }
      - { name: Java + JUnit }
      - { name: Machine learning }
      - { name: Deep learning }
      - { name: MATLAB }
      - { name: R }
  - title: Languages
    key: "Filled node: native or fluent."
    items:
      - { name: English, note: Native, full: true }
      - { name: Chinese, note: Fluent, full: true }
      - { name: Spanish, note: Learning }
      - { name: Japanese, note: Learning }

awards:
  - title: Rhodes Scholarship Nominee
    org: University of Pennsylvania
    dates: Aug 2024 and Aug 2025
    text: Endorsed by UPenn to move forward in the Rhodes Scholarship process.
  - title: Phi Beta Kappa Inductee
    org: Phi Beta Kappa
    dates: May 2025
    text: Top 8% of UPenn's graduating class of 2025.
---
