
import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  applytrack_db: D1Database
}

type Status =
  | 'Applied'
  | 'Interview'
  | 'Shortlisted'
  | 'Offer'
  | 'Rejected'

type ApplicationInput = {
  company: string
  role: string
  status?: Status
  applied_date: string
  job_url?: string
  notes?: string
}

const allowedStatuses: Status[] = [
  'Applied',
  'Interview',
  'Shortlisted',
  'Offer',
  'Rejected',
]

const app = new Hono<{ Bindings: Bindings }>()

// Allow requests from the deployed frontend
app.use(
  '/api/*',
  cors({
    origin: 'https://applytrack-frontend.pages.dev',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
  })
)

// Health check
app.get('/api/health', (c) => {
  return c.json({
    success: true,
    message: 'ApplyTrack API is running',
  })
})

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Welcome to ApplyTrack API',
  })
})

// READ: Get all applications
app.get('/api/applications', async (c) => {
  const { results } = await c.env.applytrack_db
    .prepare('SELECT * FROM applications ORDER BY created_at DESC')
    .all()

  return c.json({
    success: true,
    applications: results,
  })
})

// CREATE: Add a new application
app.post('/api/applications', async (c) => {
  const body = await c.req.json<ApplicationInput>()

  if (!body.company?.trim() || !body.role?.trim() || !body.applied_date) {
    return c.json({
      success: false,
      message: 'Company, role, and application date are required',
    }, 400)
  }

  if (body.status && !allowedStatuses.includes(body.status)) {
    return c.json({
      success: false,
      message: 'Invalid application status',
    }, 400)
  }

  const result = await c.env.applytrack_db
    .prepare(`
      INSERT INTO applications
      (company, role, status, applied_date, job_url, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    .bind(
      body.company.trim(),
      body.role.trim(),
      body.status || 'Applied',
      body.applied_date,
      body.job_url || null,
      body.notes || null
    )
    .run()

  return c.json({
    success: true,
    message: 'Application added successfully',
    id: result.meta.last_row_id,
  }, 201)
})

// UPDATE: Edit an existing application
app.put('/api/applications/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (!Number.isInteger(id) || id <= 0) {
    return c.json({
      success: false,
      message: 'Invalid application ID',
    }, 400)
  }

  const body = await c.req.json<ApplicationInput>()

  if (!body.company?.trim() || !body.role?.trim() || !body.applied_date) {
    return c.json({
      success: false,
      message: 'Company, role, and application date are required',
    }, 400)
  }

  if (body.status && !allowedStatuses.includes(body.status)) {
    return c.json({
      success: false,
      message: 'Invalid application status',
    }, 400)
  }

  const result = await c.env.applytrack_db
    .prepare(`
      UPDATE applications
      SET company = ?,
          role = ?,
          status = ?,
          applied_date = ?,
          job_url = ?,
          notes = ?
      WHERE id = ?
    `)
    .bind(
      body.company.trim(),
      body.role.trim(),
      body.status || 'Applied',
      body.applied_date,
      body.job_url || null,
      body.notes || null,
      id
    )
    .run()

  if (result.meta.changes === 0) {
    return c.json({
      success: false,
      message: 'Application not found',
    }, 404)
  }

  return c.json({
    success: true,
    message: 'Application updated successfully',
    id,
  })
})

// DELETE: Remove an application
app.delete('/api/applications/:id', async (c) => {
  const id = Number(c.req.param('id'))

  if (!Number.isInteger(id) || id <= 0) {
    return c.json({
      success: false,
      message: 'Invalid application ID',
    }, 400)
  }

  const result = await c.env.applytrack_db
    .prepare('DELETE FROM applications WHERE id = ?')
    .bind(id)
    .run()

  if (result.meta.changes === 0) {
    return c.json({
      success: false,
      message: 'Application not found',
    }, 404)
  }

  return c.json({
    success: true,
    message: 'Application deleted successfully',
    id,
  })
})

export default app
