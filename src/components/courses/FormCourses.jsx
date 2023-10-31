import React from 'react';

import { FormGroup, Label } from 'reactstrap';
import InputValidation from '../commons/InputValidation';

const FormCourses = ({ course, errors, register, onHandleChange }) => {
  return (
    <div>
      <FormGroup>
        <Label for="description">Description</Label>
        <InputValidation
          name="description"
          type="textarea"
          placeholder="Description"
          value={course.description}
          validationConfig={{
            required: false,
            onChange: onHandleChange,
            maxLength: {
              value: 255,
              message: 'Description cannot exceed 255 characters.',
            },
          }}
          errors={errors}
          register={register}
          classNames="min-h-120"
        />
      </FormGroup>
    </div>
  );
};

export default FormCourses;
