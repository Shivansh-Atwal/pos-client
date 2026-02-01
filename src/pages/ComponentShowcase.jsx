import React, { useState } from 'react'
import {
  Navbar,
  Card,
  Button,
  Table,
  FormField,
  Alert,
  Badge,
  Footer,
  Form,
} from '../Layout'
import '../../styles/codeforces.css'

/**
 * ComponentShowcase
 * Demonstrates all available components
 */
function ComponentShowcase() {
  const [alerts, setAlerts] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })

  const navMenuItems = [
    { label: 'Components', href: '#' },
    { label: 'Docs', href: '#' },
    { label: 'GitHub', href: '#' },
  ]

  const footerLinks = [
    { label: 'Documentation', href: '#' },
    { label: 'GitHub', href: '#' },
  ]

  const addAlert = (type, message) => {
    const id = Date.now()
    setAlerts([...alerts, { id, type, message }])
    setTimeout(() => removeAlert(id), 4000)
  }

  const removeAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id))
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleFormSubmit = (e) => {
    addAlert('success', `Form submitted: ${formData.name}`)
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar brandName="Component Showcase" menuItems={navMenuItems} />

      <div className="main-container">
        {/* Alerts Container */}
        {alerts.map((alert) => (
          <div key={alert.id} style={{ width: '100%' }}>
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => removeAlert(alert.id)}
            />
          </div>
        ))}

        {/* Main Content */}
        <div className="content-area">
          <h1 style={{ marginBottom: '24px' }}>Component Library Demo</h1>

          {/* Buttons Section */}
          <Card header="Buttons">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="primary" size="small">
                Small
              </Button>
              <Button variant="primary" size="large">
                Large
              </Button>
              <Button
                variant="primary"
                onClick={() => addAlert('info', 'Button clicked!')}
              >
                Click Me
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </Card>

          {/* Badges Section */}
          <Card header="Badges">
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge text="Default" variant="default" />
              <Badge text="Primary" variant="primary" />
              <Badge text="Success" variant="success" />
              <Badge text="Danger" variant="danger" />
            </div>
          </Card>

          {/* Table Section */}
          <Card header="Tables">
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Simple striped table with sample data:
            </p>
            <Table
              headers={['ID', 'Name', 'Status', 'Score']}
              rows={[
                ['1', 'Alice Johnson', 'Active', '95%'],
                ['2', 'Bob Smith', 'Active', '87%'],
                ['3', 'Carol Davis', 'Inactive', '76%'],
                ['4', 'David Wilson', 'Active', '92%'],
              ]}
              striped
            />
          </Card>

          {/* Forms Section */}
          <Card header="Form Fields">
            <Form onSubmit={handleFormSubmit}>
              <FormField
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="John Doe"
                required
              />
              <FormField
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="john@example.com"
                hint="We'll never share your email"
                required
              />
              <FormField
                label="Message"
                type="textarea"
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                placeholder="Your message here..."
              />
              <div style={{ marginTop: '16px' }}>
                <Button variant="primary" type="submit">
                  Submit
                </Button>
                <Button
                  variant="secondary"
                  style={{ marginLeft: '8px' }}
                  onClick={() => setFormData({ name: '', email: '', message: '' })}
                >
                  Clear
                </Button>
              </div>
            </Form>
          </Card>

          {/* Alerts Section */}
          <Card header="Alerts">
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <Button
                size="small"
                onClick={() => addAlert('info', 'This is an info message')}
              >
                Info Alert
              </Button>
              <Button
                size="small"
                onClick={() =>
                  addAlert('success', 'Success! Everything worked perfectly')
                }
              >
                Success Alert
              </Button>
              <Button
                size="small"
                onClick={() => addAlert('danger', 'Error: Something went wrong')}
              >
                Danger Alert
              </Button>
              <Button
                size="small"
                onClick={() => addAlert('warning', 'Warning: Please check this')}
              >
                Warning Alert
              </Button>
            </div>
            <p style={{ color: '#666', fontSize: '12px' }}>
              Click the buttons above to see different alert types
            </p>
          </Card>

          {/* Typography Section */}
          <Card header="Typography & Utilities">
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '8px' }}>Text Sizes</h3>
              <p className="text-sm">Small text (12px)</p>
              <p>Normal text (14px)</p>
              <p className="text-lg">Large text (16px)</p>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ marginBottom: '8px' }}>Text Colors</h3>
              <p>Normal text</p>
              <p className="text-muted">Muted text</p>
            </div>
            <div>
              <h3 style={{ marginBottom: '8px' }}>Alignment</h3>
              <p className="text-center">Center aligned text</p>
              <p className="text-right">Right aligned text</p>
            </div>
          </Card>

          {/* Grid Section */}
          <Card header="Grid Layouts">
            <p style={{ color: '#666', marginBottom: '16px' }}>
              Responsive 2-column grid (becomes 1 column on mobile):
            </p>
            <div className="grid grid-2">
              <Card header="Column 1">
                Left side content
              </Card>
              <Card header="Column 2">
                Right side content
              </Card>
            </div>
          </Card>

          {/* Cards Section */}
          <Card
            header="Cards"
            footer={
              <>
                <Button variant="primary" size="small">
                  Save
                </Button>
                <Button variant="secondary" size="small">
                  Cancel
                </Button>
              </>
            }
          >
            <p>
              Cards are containers for grouping related content. They come with
              optional headers and footers.
            </p>
            <p style={{ color: '#999', marginTop: '12px', fontSize: '12px' }}>
              This card demonstrates the header and footer features.
            </p>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          <Card header="Component List">
            <ul style={{ paddingLeft: '20px' }}>
              <li style={{ marginBottom: '8px' }}>
                <strong>Navbar</strong> - Top navigation
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Card</strong> - Content container
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Button</strong> - Clickable action
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Table</strong> - Data display
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>FormField</strong> - Input with label
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Alert</strong> - Status messages
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Badge</strong> - Status tags
              </li>
              <li style={{ marginBottom: '8px' }}>
                <strong>Footer</strong> - Page footer
              </li>
              <li>
                <strong>Form</strong> - Form wrapper
              </li>
            </ul>
          </Card>

          <Card header="Quick Stats">
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Components:</strong> 9
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>CSS Classes:</strong> 50+
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Responsive:</strong> Yes
              </div>
              <div>
                <strong>Theme Color:</strong> Blue (#1f8dd6)
              </div>
            </div>
          </Card>

          <Card header="Features">
            <ul style={{ paddingLeft: '20px', fontSize: '12px', color: '#666' }}>
              <li style={{ marginBottom: '6px' }}>Minimalistic design</li>
              <li style={{ marginBottom: '6px' }}>No dependencies</li>
              <li style={{ marginBottom: '6px' }}>Mobile responsive</li>
              <li style={{ marginBottom: '6px' }}>Accessibility ready</li>
              <li>Easy to customize</li>
            </ul>
          </Card>
        </aside>
      </div>

      <Footer
        copyrightText="© 2026 Component Showcase. Free to use."
        links={footerLinks}
      />
    </div>
  )
}

export default ComponentShowcase
