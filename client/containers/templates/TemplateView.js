import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import FontAwesome from 'react-fontawesome';
import { Modal, Button } from 'react-bootstrap';
import { getTemplates, postTestEmail } from '../../actions/campaignActions';
import { notify } from '../../actions/notificationActions';
import PreviewTemplateForm from '../../components/templates/PreviewTemplateForm';

function mapStateToProps(state) {
  // State reducer @ state.manageCampaign
  return {
    templates: state.manageTemplates.templates,
    isGetting: state.manageTemplates.isGetting,
    // SendTest state
    isPostingSendTest: state.sendTest.isPosting,
    sendTestEmailResponse: state.sendTest.sendTestEmailResponse,
    sendTestEmailStatus: state.sendTest.sendTestEmailStatus
  };
}

const mapDispatchToProps = { notify, getTemplates, postTestEmail };

export class TemplateViewComponent extends Component {

  static propTypes = {
    // actions
    getTemplates: PropTypes.func.isRequired,
    postTestEmail: PropTypes.func.isRequired,
    notify: PropTypes.func.isRequired,
    // redux
    templates: PropTypes.array.isRequired,
    isGetting: PropTypes.bool.isRequired,
    // route path
    params: PropTypes.object.isRequired,

    isPostingSendTest: PropTypes.bool.isRequired,
    sendTestEmailResponse: PropTypes.string.isRequired,
    sendTestEmailStatus: PropTypes.number.isRequired,
  }

  constructor() {
    super();
    this.openTestSendModal = this.openTestSendModal.bind(this);
    this.closeTestSendModal = this.closeTestSendModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.sendTestEmail = this.sendTestEmail.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  state = {
    thisTemplate: {},
    // Modals open/closed
    showTestSendModal: false,
    // Rest
    testEmail: ''
  }

  componentWillMount() {
    this.props.getTemplates();
    this.getSingleTemplate(this.props);
  }

  componentWillReceiveProps(props) {
    // Set thisCampaign from campaigns once we have it
    if (props.templates && props.templates.length && !this.props.templates.length) { // Guarded and statement that confirms campaigns is in the new props, confirms the array isn't empty, and then confirms that current props do not exist
      this.getSingleTemplate(props);
    }
  }

  getSingleTemplate(props) {
    // This method retrieves a single campaign from this.props.campaigns based on the parameter in the url
    const slug = this.props.params.slug;
    const getTemplateBySlug = props.templates.find(template => template.slug === slug);
    this.setState({
      thisTemplate: getTemplateBySlug
    });
  }

  handleSubmit() {
    const form = {
      id: this.state.thisTemplate.id
    };

    this.closeSendModal();
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
    // Get the test email & templateId then dispatch to the action controller
    const { testEmail, thisTemplate: { id: templateId } } = this.state;
    if (!testEmail) {
      this.props.notify({ message: 'Please provide an email' });
      return;
    }
    const form = { testEmail, templateId };
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
      thisTemplate,
      showTestSendModal,
      testEmail
    } = this.state;

    const {
      isPostingSendTest,
      isGetting
    } = this.props;
    
    return (
      <div>
        <div className="content-header">
          <h1>Your Template
            <small>View your template</small>
          </h1>
        </div>

        <section className="content">
          <div className="box box-primary">
            <div className="box-header">
              <h3 className="box-title">Templates: {this.state.thisTemplate.name}</h3>
            </div>

            <div className="box-body">

              <PreviewTemplateForm templateView={this.state.thisTemplate} form={this.props.form} lastPage={this.lastPage} handleSubmit={this.handleSubmit} openTestSendModal={this.openTestSendModal} submitting={this.props.isPosting}  />

              {this.props.isGetting && <div className="overlay">
                <FontAwesome name="refresh" spin/>
              </div>}
            </div>
          </div>

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
        </section>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TemplateViewComponent);