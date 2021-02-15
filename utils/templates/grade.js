const modelName = 'Grade';
const folder = 'academic/grade';
const rootFolder = `app/modules/${folder}`;

module.exports = {
  modelName,
  folder,
  rootFolder,
  apiUrl: '/academic/grades',
  model: [
    {
      field: 'name',
      type: 'string',
      unique: true,
      required: true,
      editable: true,
    },
    {
      field: 'monthly_fee',
      type: 'number',
      subtype: 'decimal',
      required: true,
      editable: true,
      factory: 'faker.random.number({ min: 1000, max: 3000 })',
    },
    {
      field: 'registration_fee',
      type: 'number',
      subtype: 'decimal',
      required: true,
      editable: true,
    },
    {
      field: 'tutorial_fee',
      type: 'number',
      subtype: 'decimal',
      required: true,
      editable: true,
    },
    {
      field: 'summer_fee',
      type: 'number',
      subtype: 'decimal',
      required: false,
      editable: true,
    },
  ],
  routes: {
    prefix: 'grades',
    map: [
      {
        method: 'post',
        path: '/',
        handleFunction: 'store',
        permission: 'add-grade',
      },
      {
        method: 'get',
        path: '/',
        handleFunction: 'index',
        permission: 'view-grade',
      },
      {
        method: 'get',
        path: '/paginate',
        handleFunction: 'paginate',
        permission: 'view-grade',
      },
      {
        method: 'get',
        path: '/:id',
        handleFunction: 'show',
        permission: 'view-grade',
      },
      {
        method: 'patch',
        path: '/:id',
        handleFunction: 'update',
        permission: 'edit-grade',
      },
      {
        method: 'delete',
        path: '/:id',
        handleFunction: 'delete',
        permission: 'remove-grade',
      },
    ],
  },
  roles: ['add-grade', 'edit-grade', 'remove-grade', 'view-grade'],
};
