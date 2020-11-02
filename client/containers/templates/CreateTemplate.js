import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import { Modal, Button } from 'react-bootstrap';
import { postTestEmail, stopSending } from '../../actions/campaignActions';
import CreateTemplateForm from '../../components/templates/CreateTemplateForm';
import PreviewTemplateForm from '../../components/templates/PreviewTemplateForm';
import { postCreateTemplate } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';
import moment from 'moment';

function mapStateToProps(state) {
  // State reducer @ state.form.createTemplate & state.createTemplate
  return {
    form: state.form.createTemplate,
    isPosting: state.createTemplate.isPosting,
    templates: state.manageTemplates.templates,
    isGetting: state.manageTemplates.isGetting,
    // SendTest state
    isPostingSendTest: state.sendTest.isPosting,
    sendTestEmailResponse: state.sendTest.sendTestEmailResponse,
    sendTestEmailStatus: state.sendTest.sendTestEmailStatus
  };
}

const mapDispatchToProps = { postCreateTemplate, postTestEmail, stopSending, notify };

export class CreateTemplateComponent extends Component {

  static propTypes = {
    form: PropTypes.object,
    isPosting: PropTypes.bool.isRequired,
    postCreateTemplate: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    isGetting: PropTypes.bool.isRequired,
    notify: PropTypes.func.isRequired,

    isPostingSendTest: PropTypes.bool.isRequired,
    sendTestEmailResponse: PropTypes.string.isRequired,
    sendTestEmailStatus: PropTypes.number.isRequired,
    
    postTestEmail: PropTypes.func.isRequired,
    stopSending: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.lastPage = this.lastPage.bind(this);
    this.validationFailed = this.validationFailed.bind(this);
    this.passResetToState = this.passResetToState.bind(this);
    this.openTestSendModal = this.openTestSendModal.bind(this);
    this.closeTestSendModal = this.closeTestSendModal.bind(this);
    this.sendTestEmail = this.sendTestEmail.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    page: 1,
    initialFormValues: {
      templateName: `Template - ${moment().format('l, h:mm:ss')}`,
      type: 'Plaintext'
    },
    editor: '',
    // Modals open/closed
    showTestSendModal: false,
    // Rest
    reset: null,
    testEmail: ''
  }
  
  componentWillReceiveProps(props) {
    if (this.props.isPosting === true && props.isPosting === false) { // Fires when template has been successfully created
      this.setState({ page: 1 });
      this.props.notify({
        message: 'Your template was created successfully',
        colour: 'green'
      });
    }
  }

  handleSubmit() {
    this.props.postCreateTemplate(JSON.stringify(this.props.form.values), this.state.reset);
  }

  nextPage() {
    this.setState({ page: this.state.page + 1 });
  }

  lastPage() {
    this.setState({ page: this.state.page - 1 });
  }

  validationFailed(reason) {
    this.props.notify({
      message: reason
    });
  }

  passResetToState(reset) {
    this.setState({ reset });
  }

  //new function send test mail
  openTestSendModal() {
    this.setState({
      showTestSendModal: true
    });
  }

  closeTestSendModal() {
    this.setState({
      showTestSendModal: false
    });
  }

  sendTestEmail() {
    // Get the test email & campaignId then dispatch to the action controller
    const { testEmail } = this.state;
    if (!testEmail) {
      this.props.notify({ message: 'Please provide an email' });
      return;
    }
    const form = { testEmail };
    this.props.postTestEmail(JSON.stringify(form));
    this.setState({
      testEmail: ''
    });
    this.closeTestSendModal();
  }

  handleChange(e) {
    this.setState({
      [e.target.id]: e.target.value
    });
  }

  render() {
    const { 
      page,
      showTestSendModal,
      testEmail
    } = this.state;

    const {
      isPostingSendTest
    } = this.props;

    const type = (this.props.form && this.props.form.values.type) || this.state.initialFormValues.type;

    return (
      <div>
        <div className="content-header">
          <h1>Templates
            <small>Create and manage your templates</small>
          </h1>
        </div>

        <section className="content">
          <div className="box box-primary">
            <div className="box-body">
              {page === 1 && <CreateTemplateForm passResetToState={this.passResetToState} textEditorType={type} validationFailed={this.validationFailed} nextPage={this.nextPage} initialValues={this.state.initialFormValues} />}
              {page === 2 && <PreviewTemplateForm form={this.props.form} lastPage={this.lastPage} handleSubmit={this.handleSubmit} openTestSendModal={this.openTestSendModal} submitting={this.props.isPosting} />}
            </div>
            {this.props.isPosting || this.props.isGetting && <div className="overlay">
              <FontAwesome name="refresh" spin/>
            </div>}

            {/* Modal for sending test emails */}
            <Modal show={showTestSendModal} onHide={this.closeTestSendModal}>
              <Modal.Header closeButton>
                <Modal.Title>Send a test email</Modal.Title>
              </Modal.Header>

              <Modal.Body>
                <input className="form-control" style={{ "marginLeft": "1rem" }} id="testEmail" placeholder="Send a test email to:" type="email" value={testEmail} onChange={this.handleChange} />
              </Modal.Body>

              <Modal.Footer>
                <Button onClick={this.closeTestSendModal}>Cancel</Button>
                <Button bsStyle="primary" onClick={this.sendTestEmail}>Send Test Email</Button>
              </Modal.Footer>
            </Modal>
          </div>
        </section>

      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateTemplateComponent);
