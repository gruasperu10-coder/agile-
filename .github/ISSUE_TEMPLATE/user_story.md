name: User Story
description: Template for creating agile user stories
title: "US: "
labels: ["user-story"]
body:
  - type: textarea
    id: description
    attributes:
      label: User Story
      description: Follow the template "As a [role], I need [feature], So that [benefit]"
      placeholder: "As a..., I need..., So that..."
    validations:
      required: true
  - type: textarea
    id: acceptance_criteria
    attributes:
      label: Acceptance Criteria
      description: Follow Gherkin syntax "Given [context], When [action], Then [result]"
      placeholder: "Given..., When..., Then..."
    validations:
      required: true
  - type: input
    id: estimate
    attributes:
      label: Estimate (Story Points)
      placeholder: "e.g. 3, 5, 8"
    validations:
      required: true
