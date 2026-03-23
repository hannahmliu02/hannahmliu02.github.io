---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2022-10-24
type: landing

design:
  # Default section spacing
  spacing: '6rem'

sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: me
      text: ''
      button:
      headings:
        about: 'About Me'
        education: ''
        interests: 'Academic Interests'
    design:
      background:
        gradient_mesh:
          enable: true

      # Name heading sizing to accommodate long or short names
      name:
        size: md # Options: xs, sm, md, lg (default), xl

      # Avatar customization
      avatar:
        size: medium # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded
  - block: markdown
    content:
      title: 'Skills & Hobbies'
      text: |
        <div class="mt-2">
          <h3 class="text-sm font-semibold uppercase tracking-wide mb-2 text-white/70">Technical</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Python</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Java + JUnit</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Machine Learning</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Deep Learning</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">MatLab</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">R</span>
          </div>
          <h3 class="text-sm font-semibold uppercase tracking-wide mb-2 text-white/70">Languages</h3>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">English (native)</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Chinese (fluent)</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Spanish (learning!)</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Japanese (learning!)</span>
          </div>
          <h3 class="text-sm font-semibold uppercase tracking-wide mb-2 text-white/70">In my free time, I like to...</h3>
          <div class="flex flex-wrap gap-2">
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Swim (former NCAA D1 Athlete)</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Listen to music</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Make films</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Write</span>
            <span class="rounded-full bg-white/20 px-3 py-1 text-sm text-white">Wander</span>
          </div>
        </div>
    design:
      background:
        color: "#1e2f5e"
      spacing:
        padding: ['2rem', 0, '2rem', 0]
---
