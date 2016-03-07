import React from 'react';
import Relay from 'react-relay';

import Panel from '../shared/Panel'
import Button from '../shared/Button'

class Index extends React.Component {
  static propTypes = {
    organization: React.PropTypes.shape({
      slug: React.PropTypes.string.isRequired,
      teams: React.PropTypes.shape({
        edges: React.PropTypes.arrayOf(
          React.PropTypes.shape({
            node: React.PropTypes.shape({
              id: React.PropTypes.string.isRequired,
              name: React.PropTypes.string.isRequired,
              members: React.PropTypes.shape({
                count: React.PropTypes.number.isRequired
              }).isRequired,
              pipelines: React.PropTypes.shape({
                count: React.PropTypes.number.isRequired
              }).isRequired
            }).isRequired
          }).isRequired
        ).isRequired
      }).isRequired
    }).isRequired
  };

  render() {
    return (
      <Panel>
        <Panel.Header>Teams</Panel.Header>
        <Panel.IntroWithButton>
          <span>Manage your teams and make some awesome ones so you can do super awesome stuff like organzing users and projects into teams so you can do permissions and stuff.</span>
          <Button link={`/organizations/${this.props.organization.slug}/teams/new`}>New Team</Button>
        </Panel.IntroWithButton>
        {
          this.props.organization.teams.edges.map((team) => {
            return (
              <Panel.RowLink key={team.node.id} to={`/organizations/${this.props.organization.slug}/teams/${team.node.slug}`}>
                <strong className="semi-bold">{team.node.name}</strong><br/>
                <span className="regular dark-gray">{team.node.members.count} members · {team.node.pipelines.count} projects</span><br/>
              </Panel.RowLink>
              )
          })
        }
      </Panel>
    );
  }
}

export default Relay.createContainer(Index, {
  fragments: {
    organization: () => Relay.QL`
      fragment on Organization {
        slug
        teams(first: 100) {
          edges {
            node {
              id,
              name,
              description,
              slug,
              members {
                count
              },
              pipelines {
                count
              }
            }
          }
        }
      }
    `
  }
});
