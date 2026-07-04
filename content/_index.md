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
  - block: resume-biography
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: me
      text: 'My research and professional work primarily focuses on creating the mechanisms required to build globally applicable, ethically adequate, and decentralised AI governance frameworks. I use my background in cognitive science and computation to answer sociotechnical questions about AI applications, deriving insights from fields such as psychology, neuroscience, linguistics, and philosophy to better inform approaches to computational problems. I also analyse how we can best integrate AI applications into society without causing harm to underrepresented populations.'
      # Optionally show a call-to-action button below the bio
      button:
    design:
      # Center the bio text under the name
      biography:
        style: 'text-align: center;'

      # Clean, centered hero on a plain background (re-enable the mesh below if you
      # want your navy gradient back)
      # background:
        gradient_mesh:
          enable: true

      # Avatar customization
      avatar:
        size: medium # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: circle # Options: circle (default), square, rounded
---
