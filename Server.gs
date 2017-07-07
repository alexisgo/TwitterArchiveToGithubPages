/**
* Part of index.html to return completed steps and any log in buttons.
* @return {Object} - steps completed
*/
function getCompletedSteps(){
  var properties = JSON.parse(PropertiesService.getUserProperties().getProperty('twgit_properties')) || {};
  var steps = { icons: {
               'github': 'fa-github',
               'folder-open': 'fa-folder-open' },
               links: {}};
  
  if (getGithubService_().hasAccess()){
    steps.icons['github'] = 'completed'
    steps.links['github'] = '<button id="github_signout" class="ui github button"><i class="fa fa-github icon"></i>Disconnect Github</button>';
  } else {
    steps.links['github'] = getGithubAuthURL();
  }
  if (properties.git_repo && properties.git_repo.name){
    steps.icons['folder-open'] = 'completed';
  }
  if (properties.trigger && properties.trigger.id){
    steps.icons['clock-o'] = 'completed';
  }
  return steps;
}

/**
* Gets list of Github users repositories.
* @return {Object} - repos from Github
*/
function getRepoList(){
  var properties = JSON.parse(PropertiesService.getUserProperties().getProperty('twgit_properties')) || {};
  Github.setTokenService(function(){ return getGithubService_().getAccessToken();});
  
  if (!properties.git_repo || (properties.git_repo && !properties.git_repo.owner)){
    properties.git_repo = {owner: Github.User.getProfile().login};
    PropertiesService.getUserProperties().setProperty('twgit_properties', JSON.stringify(properties));
  } 
  
  var items_list = Github.User.listRepos({sort:'created', direction:'desc'});
  items_list = items_list.filter(function (el) {
                           return el.owner.login == properties.git_repo.owner} );
  var repo = {items: items_list,
              git_repo: properties.git_repo || false }; 
  return repo;
}

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function disconnectGithub() {
  getGithubService_().reset();
  processRepoForm(false)
  processClockForm(false);
  return getCompletedSteps();
}

/**
* Handles repo selection
*
* @param {Object} formObject
* @param {string} message for nag
*/
function processRepoForm(formObject) {
  var properties = JSON.parse(PropertiesService.getUserProperties().getProperty('twgit_properties')) || {};
  properties.git_repo.name = formObject.repo || false;
  properties.git_repo.sub_dir = formObject.sub_dir || '';

  
  PropertiesService.getUserProperties().setProperty('twgit_properties', JSON.stringify(properties));
  return JSON.stringify({text: "Repository settings saved"});
}