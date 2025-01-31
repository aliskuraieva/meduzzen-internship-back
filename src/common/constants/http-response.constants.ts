export const HttpResponse = {
    SUCCESS: {
      status: 200,
      description: 'Successfully retrieved data',
    },
    CREATED: {
      status: 201,
      description: 'Successfully created resource',
    },
    UPDATED: {
      status: 200,
      description: 'Successfully updated resource',
    },
    DELETED: {
      status: 200,
      description: 'Successfully deleted resource',
    },
    NOT_FOUND: {
      status: 404,
      description: 'Resource not found',
    },
    BAD_REQUEST: {
      status: 400,
      description: 'Bad request',
    },
    UNAUTHORIZED: {
      status: 401,
      description: 'Unauthorized access',
    },
    FORBIDDEN: {
      status: 403,
      description: 'Forbidden access',
    },
  };
  