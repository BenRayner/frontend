import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import DocumentTitle from 'react-document-title';

import Dropdown from '../shared/Dropdown';
import Icon from '../shared/Icon';
import Panel from '../shared/Panel';
import PageHeader from '../shared/PageHeader';
import ShowMoreFooter from '../shared/ShowMoreFooter';

import AuditLogRow from './row';

const PAGE_SIZE = 30;

const EVENT_SUBJECTS = [
  { name: 'Any Subject', id: null },
  { name: 'Pipeline events', id: 'PIPELINE' },
  { name: 'Organization events', id: 'ORGANIZATION' }
];

class AuditLogIndex extends React.PureComponent {
  static propTypes = {
    organization: PropTypes.shape({
      name: PropTypes.string.isRequired,
      auditEvents: PropTypes.shape({
        edges: PropTypes.array
      }).isRequired
    }).isRequired,
    relay: PropTypes.object.isRequired
  };

  state = {
    loading: false
  };

  render() {
    return (
      <DocumentTitle title={`Audit Log · ${this.props.organization.name}`}>
        <div>
          <PageHeader>
            <PageHeader.Icon>
              <Icon
                icon="eye"
                className="align-middle mr2"
                style={{ width: 40, height: 40 }}
              />
            </PageHeader.Icon>
            <PageHeader.Title>
              Audit Log
            </PageHeader.Title>
            <PageHeader.Description>
              Event log of all organization activity
            </PageHeader.Description>
          </PageHeader>

          {this.renderDetailsPanel()}
        </div>
      </DocumentTitle>
    );
  }

  renderDetailsPanel() {
    return (
      <Panel>
        <Panel.Section>
          <Dropdown width={180} ref={(_eventSubjectDropdown) => this._eventSubjectDropdown = _eventSubjectDropdown}>
            <div className="underline-dotted cursor-pointer inline-block regular dark-gray">
              {EVENT_SUBJECTS.find((subject) => subject.id === this.props.relay.variables.subjectType).name}
            </div>
            {this.renderEventSubjects()}
          </Dropdown>
        </Panel.Section>

        {this.props.organization.auditEvents.edges.map((edge) => (
          <AuditLogRow
            key={edge.node.id}
            auditEvent={edge.node}
          />
        ))}

        <ShowMoreFooter
          connection={this.props.organization.auditEvents}
          loading={this.state.loading}
          onShowMore={this.handleShowMoreAuditEvents}
        />
      </Panel>
    );
  }

  handleShowMoreAuditEvents = () => {
    this.setState({ loading: true });

    this.props.relay.setVariables(
      {
        pageSize: this.props.relay.variables.pageSize + PAGE_SIZE
      },
      (readyState) => {
        if (readyState.done) {
          this.setState({ loading: false });
        }
      }
    );
  };

  renderEventSubjects() {
    return EVENT_SUBJECTS.map((subject) => {
      return (
        <div
          key={`subject-${subject.id}`}
          className="btn block hover-bg-silver"
          onClick={() => {
            this._eventSubjectDropdown.setShowing(false);
            this.handleEventSubjectSelect(subject.id);
          }}
        >
          <span className="block">{subject.name}</span>
        </div>
      );
    });
  }

  handleEventSubjectSelect = (subjectType) => {
    this.setState({ loading: true });

    this.props.relay.setVariables(
      {
        pageSize: PAGE_SIZE,
        subjectType
      },
      (readyState) => {
        if (readyState.done) {
          this.setState({ loading: false });
        }
      }
    );
  };
}

export default Relay.createContainer(AuditLogIndex, {
  initialVariables: {
    pageSize: PAGE_SIZE,
    subjectType: null
  },

  fragments: {
    organization: () => Relay.QL`
      fragment on Organization {
        name
        auditEvents(first: $pageSize, subject_type: $subjectType) {
          edges {
            node {
              id
              ${AuditLogRow.getFragment('auditEvent')}
            }
          }
          ${ShowMoreFooter.getFragment('connection')}
        }
      }
    `
  }
});
