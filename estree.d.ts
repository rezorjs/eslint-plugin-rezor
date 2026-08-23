import type { Node } from 'estree'

declare module 'estree' {
  interface BaseNodeWithoutComments {
    /** Set by ESLint when traversing a parsed syntax tree. */
    parent?: Node
  }

  interface TSAsExpression extends BaseNode {
    type: 'TSAsExpression'
    expression: Node
  }

  interface TSTypeQuery extends BaseNode {
    type: 'TSTypeQuery'
  }

  interface TSTypeReference extends BaseNode {
    type: 'TSTypeReference'
  }

  interface NodeMap {
    TSAsExpression: TSAsExpression
    TSTypeQuery: TSTypeQuery
    TSTypeReference: TSTypeReference
  }
}
