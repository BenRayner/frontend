import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';

import BuildStateSwitcher from '../../build/StateSwitcher';

import PusherStore from '../../../stores/PusherStore';

class Builds extends React.Component {
  static propTypes = {
    pipeline: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
    className: PropTypes.string,
    buildState: PropTypes.string
  };

  componentDidMount() {
    PusherStore.on("websocket:event", this.handlePusherWebsocketEvent);
  }

  componentWillUnmount() {
    PusherStore.off("websocket:event", this.handlePusherWebsocketEvent);
  }

  render() {
    return (
      <BuildStateSwitcher
        className={this.props.className}
        buildsCount={this.props.pipeline.builds.count}
        runningBuildsCount={this.props.pipeline.runningBuilds.count}
        scheduledBuildsCount={this.props.pipeline.scheduledBuilds.count}
        state={this.props.buildState}
        path={`/${this.props.pipeline.organization.slug}/${this.props.pipeline.slug}/builds`}
      />
    );
  }

  handlePusherWebsocketEvent = (payload) => {
    if (payload.event === "project:updated" && payload.graphql.id === this.props.pipeline.id) {
      this.props.relay.forceFetch();
    }
  };
}

export default Relay.createContainer(Builds, {
  fragments: {
    pipeline: () => Relay.QL`
      fragment on Pipeline {
        id
        slug
        organization {
          slug
        }
        builds {
          count
        }
        scheduledBuilds: builds(state: SCHEDULED) {
          count
        }
        runningBuilds: builds(state: RUNNING) {
          count
        }
      }
    `
  }
});
