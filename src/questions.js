const inquirer = require('inquirer') //创建交互式的命令行界面

module.exports = {

  askGithubCredentials: () => {
    const questions = [
      {
        name: 'title',
        type: 'input',
        message: 'Enter your GitHub username or e-mail address:',
        validate: function (value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your username or e-mail address.';
          }
        }
      },
      {
        name: 'name',
        type: 'input',
        message: 'Enter your password:'
      }
    ];
    return inquirer.prompt(questions);
  },
}