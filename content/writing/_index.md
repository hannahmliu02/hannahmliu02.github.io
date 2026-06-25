---
title: Writing & Speaking
# Hide this page's title in the page header
cms_exclude: true
type: landing

design:
  spacing: '2rem'

sections:
  - block: collection
    content:
      title: Writing
      text: |-
        Papers, essays, articles, and other pieces I've written. 
      # 0 = show all items
      count: 0
      filters:
        folders:
          - writing
      sort_by: Date
      sort_ascending: false
    design:
      view: card
      columns: 3
      # External pieces have no body text, so hide the estimated read time
      show_read_time: false
      show_read_more: true
      background:
        gradient_mesh:
          enable: true

  - block: markdown
    content:
      title: ''
      text: |-
        ## Speaking

        **Panel: Ensuring Growing AI Use Isn’t Increasing Security Risk ** | London Tech Week 2026 | June 2026
        - Discussed the fluid yet nuanced definition of AI risk, the risks of shadow AI, how to manage risk at scale, and future steps towards effective AI governance.
        - [Agenda.](https://londontechweek.com/2026-agenda)

        ---

         **Partner-Led Meetup: Ensuring Growing AI Use Isn’t Increasing Security Risk ** | AI Summit London 2026 | June 2026
        - Facilitated a discussion about the real pain points organizations face with AI governance and how the Responsible AI Institute's TrustX framework and member community provide solutions and avenues for collaboration
        - [Agenda.](https://london.theaisummit.com/conference-agenda/full-agenda/)

        ---

        **Poster: Investigating the Presence of Bias and Potential Copyright Concerns in LLM Image Generation Capabilities** | Penn NRCP 2025 | October 2026
        - Used quantitative and qualitative sociotechnical evaluation methods to investigate racial bias, gender bias, and potential copyright concerns in LLM-generated movie posters.
        - [Poster and oral presentation.](/uploads/nrcp.pdf)
        - [Work-in-progress manuscript.](/uploads/chi2026.pdf)

        ---

        **Comparing Predictive Machine Learning Models' Capacity to Objectively Predict Dyspnea** | BMES 2023 Annual Meeting | October 2023
        - Developed predictive ML models that automatically and accurately estimated a patient's breathing exertion levels; allowed doctors to monitor patient with respiratory illness without using physically invasive methods. 
        - [Poster presentation.](/uploads/bmes.pdf)
---
