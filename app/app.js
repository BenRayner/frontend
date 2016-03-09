import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import Bugsnag from 'bugsnag-js';

require("./css/main.css");

if(window._standalone) {
  // Reset includes all the styles needed if bootstrap.css isn't loaded on the page
  require("./css/reset.css");
} else {
  // Fixes and additions to the old bootstrap styles
  require("./css/legacy.css");
}

// Setup Bugsnag for JS error tracking
if(window._bugsnag) {
  Bugsnag.apiKey = window._bugsnag.apiKey;
  Bugsnag.appVersion = window._bugsnag.appVersion;
  Bugsnag.user = window._bugsnag.user;
  Bugsnag.releaseStage = window._bugsnag.releaseStage;
  Bugsnag.notifyReleaseStages = window._bugsnag.notifyReleaseStages;
}

// Allows old sprockets and inline-javascript to access webpack modules
window["Webpack"] = {
  modules: {
    "react": require("react"),
    "react-dom": require("react-dom"),
    "react-relay": require("react-relay"),
    "classnames": require("classnames"),
    "moment": require("moment"),
    "object-assign": require("object-assign"),
    "eventemitter3": require("eventemitter3"),

    "components/layout/Navigation": require("./components/layout/Navigation").default,
    "components/layout/Footer": require("./components/layout/Footer").default,
    "components/shared/FormTextField": require("./components/shared/FormTextField").default,
    "components/shared/FormMarkdownEditorField": require("./components/shared/FormMarkdownEditorField").default,
    "components/shared/CollapsableFormField": require("./components/shared/CollapsableFormField").default,
    "components/shared/Emojify": require("./components/shared/Emojify").default,
    "components/organization/AgentsCount": require("./components/organization/AgentsCount").default,
    "components/organization/SettingsMenu": require("./components/organization/SettingsMenu").default,
    "components/user/SettingsMenu": require("./components/user/SettingsMenu").default,
    "components/PipelinesWelcome": require("./components/PipelinesWelcome").default,
    "stores/PusherStore": require("./stores/PusherStore").default,
    "lib/friendlyRelativeTime": require("./lib/friendlyRelativeTime").default,
    "lib/Logger": require("./lib/Logger").default,
    "lib/Emoji": require("./lib/Emoji").default
  },

  require: function(module) {
    let exported = window["Webpack"].modules[module]

    if(exported) {
      return exported
    } else {
      throw "No webpack module exported `" + module + "`"
    }
  }
}

// Configure relay if we have access to the GraphQL URL
if(window._graphql) {
  Relay.injectNetworkLayer(
    new Relay.DefaultNetworkLayer(window._graphql['url'], { headers: { 'Authorization': window._graphql['authorization'] } })
  );
}

// Only do the react-router gear on pages we've designated
window["initializeReactRouter"] = function() {
  // Require the packages we need to setup routing
  let Route = require("react-router").Route;
  let IndexRoute = require("react-router").IndexRoute;
  let browserHistory = require("react-router").browserHistory;
  let RelayRouter = require('react-router-relay').RelayRouter;

  // The components used in the router
  let Main = require("./components/Main").default;
  let BuildCommentsList = require("./components/build/CommentsList").default;
  let OrganizationSettingsSection = require("./components/organization/SettingsSection").default;
  let TeamIndex = require("./components/team/Index").default;
  let TeamNew = require("./components/team/New").default;
  let TeamShow = require("./components/team/Show").default;
  let TeamEdit = require("./components/team/Edit").default;

  // Loading components
  let PageLoader = require("./components/shared/PageLoader").default;
  let SectionLoader = require("./components/shared/SectionLoader").default;

  const BuildQuery = () => Relay.QL`
    query {
      build(slug: $slug)
    }
  `

  const ViewerQuery = () => Relay.QL`
    query {
      viewer
    }
  `

  const OrganizationQuery = () => Relay.QL`
    query {
      organization(slug: $organization)
    }
  `

  const TeamQuery = () => Relay.QL`
    query {
      team(slug: $slug)
    }
  `

  const handlePageLoading = () => {
    return (
      <PageLoader />
    )
  }

  const handleSectionLoading = () => {
    return (
      <SectionLoader />
    )
  }

  // Since relay doesn't currently support root fields with multiple
  // parameters, it means we can't have queries like: build(org: "...",
  // pipeline: "...", number: "12"), so we have to do this hacky thing where we
  // include them all in the `slug` param.
  const prepareBuildParams = (params) => {
    return {
      ...params,
      slug: [ params.organization, params.pipeline, params.number ].join("/")
    };
  }

  const prepareTeamParams = (params) => {
    return {
      ...params,
      slug: [ params.organization, params.team ].join("/")
    };
  }

  // Define and render the routes
  ReactDOM.render(
    <RelayRouter history={browserHistory}>
      <Route path="/:organization/:pipeline/builds/:number" component={BuildCommentsList} queries={{viewer: ViewerQuery, build: BuildQuery}} prepareParams={prepareBuildParams} />

      <Route path="/" component={Main} queries={{viewer: ViewerQuery, organization: OrganizationQuery}} renderLoading={handlePageLoading}>
        <Route path="organizations/:organization" component={OrganizationSettingsSection} queries={{organization: OrganizationQuery}} renderLoading={handleSectionLoading}>
          <Route path="teams">
            <IndexRoute component={TeamIndex} queries={{organization: OrganizationQuery}} renderLoading={handleSectionLoading} />
            <Route path="new" component={TeamNew} queries={{organization: OrganizationQuery}} renderLoading={handleSectionLoading} />
            <Route path=":team" component={TeamShow} queries={{organization: OrganizationQuery, team: TeamQuery, viewer: ViewerQuery}} prepareParams={prepareTeamParams} renderLoading={handleSectionLoading} />
            <Route path=":team/edit" component={TeamEdit} queries={{organization: OrganizationQuery, team: TeamQuery}} prepareParams={prepareTeamParams} renderLoading={handleSectionLoading} />
          </Route>
        </Route>
      </Route>
    </RelayRouter>
  , document.getElementById('root'));
}
