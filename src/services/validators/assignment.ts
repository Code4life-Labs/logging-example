import Joi from "joi";

export const AssignmentValidator = Joi.object({
  taskId: Joi.string().required(),
  assignees: Joi.array().items(Joi.string()).empty("").default([]),
  createdAt: Joi.number().default(Date.now()),
  updatedAt: Joi.number().default(Date.now()),
});

export const UpdatedAssignmentValidator = Joi.object({
  taskId: Joi.string().empty(),
  assignees: Joi.array().items(Joi.string()).empty("").default([]),
  createdAt: Joi.number().empty(""),
  updatedAt: Joi.number().default(Date.now()),
});
