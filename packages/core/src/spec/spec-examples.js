/**
 * Generate component examples from component type
 * @param {string} componentType - Type of component
 * @returns {Array} Examples
 */
export function generateExamples(componentType) {
  const examples = {
    button: [
      { name: "Primary", code: '<Button variant="primary">Click me</Button>' },
      { name: "Secondary", code: '<Button variant="secondary">Click me</Button>' },
      { name: "Loading", code: '<Button variant="primary" loading>Loading...</Button>' },
      { name: "Disabled", code: '<Button variant="primary" disabled>Disabled</Button>' },
    ],
    input: [
      { name: "Basic", code: '<Input placeholder="Enter text..." />' },
      {
        name: "With Label",
        code: '<Input label="Email" type="email" placeholder="you@example.com" />',
      },
      { name: "Error", code: '<Input error="Invalid email" value="invalid" />' },
    ],
    card: [
      { name: "Elevated", code: '<Card variant="elevated">Content</Card>' },
      { name: "Outlined", code: '<Card variant="outlined">Content</Card>' },
    ],
    modal: [
      { name: "Basic", code: '<Modal open onClose={handleClose} title="Title">Content</Modal>' },
    ],
  };

  return examples[componentType] || [];
}
