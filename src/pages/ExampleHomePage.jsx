import React, { useState } from 'react'
import Navbar from '../Layout/Navbar'
import Card from '../Layout/Card'
import Button from '../Layout/Button'
import Table from '../Layout/Table'
import FormField from '../Layout/FormField'
import Alert from '../Layout/Alert'
import Badge from '../Layout/Badge'
import Footer from '../Layout/Footer'
import Form from '../Layout/Form'

/**
 * ExampleHomePage
 * Demonstrates all Codeforces-style components
 */
function ExampleHomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProblem, setSelectedProblem] = useState(null)
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'info', message: 'Welcome to the application' },
  ])

  const navMenuItems = [
    { label: 'Problems', href: '#' },
    { label: 'Contests', href: '#' },
    { label: 'Discuss', href: '#' },
    { label: 'Login', href: '#' },
    { label: 'Register', href: '#' },
  ]

  const footerLinks = [
    { label: 'About', href: '#' },
    { label: 'Contact', href: '#' },
    { label: 'Terms', href: '#' },
    { label: 'Privacy', href: '#' },
  ]

  // Sample problem data
  const problems = [
    ['1001', 'A. Simple Problem', 'Easy', '1234', '98%'],
    ['1002', 'B. Medium Challenge', 'Medium', '567', '65%'],
    ['1003', 'C. Hard Problem', 'Hard', '123', '32%'],
    ['1004', 'D. Advanced Topic', 'Hard', '89', '18%'],
  ]

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleSubmit = (e) => {
    console.log('Form submitted')
    addAlert('success', 'Action completed successfully!')
  }

  const addAlert = (type, message) => {
    const id = Date.now()
    setAlerts([...alerts, { id, type, message }])
    setTimeout(() => removeAlert(id), 4000)
  }

  const removeAlert = (id) => {
    setAlerts(alerts.filter((a) => a.id !== id))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar
        brandName="CodeApp"
        menuItems={navMenuItems}
      />

      <div className="main-container">
        {/* Alerts */}
        <div style={{ width: '100%' }}>
          {alerts.map((alert) => (
            <Alert
              key={alert.id}
              type={alert.type}
              message={alert.message}
              onClose={() => removeAlert(alert.id)}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="content-area">
          {/* Title */}
          <h1 style={{ marginBottom: '24px', fontSize: '24px' }}>Problems</h1>

          {/* Search Card */}
          <Card header="Search Problems">
            <input
              type="search"
              className="form-control"
              placeholder="Search by problem name..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </Card>

          {/* Problems Table Card */}
          <Card header="Problem List">
            <Table
              headers={['ID', 'Title', 'Difficulty', 'Submissions', 'Acceptance']}
              rows={problems}
              striped
            />
          </Card>

          {/* Form Example Card */}
          <Card header="Submit Solution">
            <Form onSubmit={handleSubmit}>
              <FormField
                label="Problem ID"
                type="text"
                name="problemId"
                placeholder="Enter problem ID"
                required
              />
              <FormField
                label="Language"
                type="text"
                name="language"
                placeholder="C++, Python, Java, etc."
                required
              />
              <FormField
                label="Code"
                type="textarea"
                name="code"
                placeholder="Paste your code here..."
                hint="Maximum 256 KB"
              />
              <div style={{ marginTop: '16px' }}>
                <Button variant="primary" type="submit">
                  Submit Solution
                </Button>
                <Button
                  variant="secondary"
                  style={{ marginLeft: '8px' }}
                  onClick={() => addAlert('info', 'Form cleared')}
                >
                  Clear
                </Button>
              </div>
            </Form>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="sidebar">
          <Card header="Statistics">
            <div style={{ color: '#666' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Total Problems:</strong> 450
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Solved:</strong> 128
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Success Rate:</strong> 28%
              </div>
            </div>
          </Card>

          <Card header="Filters">
            <div style={{ marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                Difficulty
              </p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <Badge text="Easy" variant="success" />
                <Badge text="Medium" variant="primary" />
                <Badge text="Hard" variant="danger" />
              </div>
            </div>
            <div>
              <Button variant="secondary" size="small">
                Apply Filters
              </Button>
            </div>
          </Card>

          <Card header="Recent Activity">
            <div style={{ fontSize: '12px', color: '#666' }}>
              <div style={{ marginBottom: '8px' }}>
                Submitted to Problem A
              </div>
              <div style={{ marginBottom: '8px' }}>
                Solved Problem B
              </div>
              <div>Joined Contest #5</div>
            </div>
          </Card>
        </aside>
      </div>

      <Footer
        copyrightText="© 2026 CodeApp. All rights reserved."
        links={footerLinks}
      />
    </div>
  )
}

export default ExampleHomePage
