import { createAccessControl } from 'better-auth/plugins/access'

import { defaultStatements } from 'better-auth/plugins/organization/access'

const statement = {
  ...defaultStatements,

  project: ['create', 'share', 'update', 'delete', 'read', 'list']
} as const

const ac = createAccessControl(statement)

const user = ac.newRole({
  project: ['create']
})

const admin = ac.newRole({
  project: ['create', 'update']
})

const owner = ac.newRole({
  project: ['create', 'read', 'update', 'delete'],
  organization: ['update', 'delete']
})

export { ac, user, admin, owner, statement }
