import React, { Component, PropTypes } from 'react';
import { Editor } from '@gevorg2/tinymce-react-15';

export default class TextEditorRich extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func
  }

  handleEditorChange = (content, editor) => {
    this.props.onChange(content);
  }

  render() {
    const { value, onChange } = this.props;
    return (
      <Editor
        apiKey='5wvvu6tuyfsyneyxy4u9656vf8qoyn6zizbi4r1epsczo87d'
        initialValue="<p>This is the initial content of the editor</p>"
        init={{
          height: 500,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
          ],
          toolbar:
            'undo redo | styleselect | forecolor | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | link image | code'
        }}
        onEditorChange={this.handleEditorChange}
        id="TextEditorRich"
        bounds="#TextEditorRich"
        value={value}
        // onChange={onChange}
      />
    );
  }
};
