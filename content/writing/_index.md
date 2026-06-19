---
title: Writing
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
        Essays, newsletters, and other pieces I've written. For peer-reviewed work, see [Publications](/publications/).
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
---
