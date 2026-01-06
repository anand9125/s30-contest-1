# supervisorId String?
⚠️ This exists only for agents.

Meaning:

Agent belongs to one supervisor

Supervisor manages many agents

For other roles:
# self relation
A row in the User table points to another row in the SAME table.
Here:

Agent row → points to Supervisor row

# plain englis
supervisorId stores the ID of another user

That other user must be a supervisor

Prisma links them using the relation name "SupervisorAgents"

# Why Not One conversations[]?

Because a user can participate in a conversation in different roles.
Example:

Same person could be:

A candidate in one conversation

A supervisor in another

We must distinguish intent.