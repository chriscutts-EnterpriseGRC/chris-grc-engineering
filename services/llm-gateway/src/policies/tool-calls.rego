package grc.llm.tool_calls

# Authoritative OPA policy for LLM tool call access control.
# The mirrored JavaScript implementation is at tool-calls.js.
# To use with OPA CLI: opa eval -d tool-calls.rego -i input.json "data.grc.llm.tool_calls.allow"

default allow = false
default deny_reason = "policy_default_deny"

# Read-only tool calls: any authenticated caller may proceed
allow if {
    input.write_operation == false
    input.caller_id != null
    input.caller_id != ""
}

# Write tool calls: must have human approval and an authorised role
allow if {
    input.write_operation == true
    input.approved_by != null
    input.approved_by != ""
    input.caller_role in {"admin", "security_engineer", "mcp_server"}
}

deny_reason = "unauthenticated_caller" if {
    not input.caller_id
}

deny_reason = "write_requires_approval" if {
    input.write_operation == true
    not input.approved_by
}

deny_reason = "insufficient_role_for_write" if {
    input.write_operation == true
    input.approved_by != null
    not input.caller_role in {"admin", "security_engineer", "mcp_server"}
}
