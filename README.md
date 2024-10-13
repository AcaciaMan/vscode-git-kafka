# vscode-git-kafka
Visual Studio Code extension to invoke git commands and store results in SOLR search index server

Git is great version control system with good commands in scripts. Visual Studio extension to publish commands results in windows UI and and store results in SOLR search index server.

Execute - run git command in current workspace folder, Execute Dirs - run git command recursively in subdirectories set in DIRS PATHS.

SOLR Search - do SOLR search in git Excute command output text, Search Dirs - do SOLR search in Execute Dirs command output text.

## v0.0.3 Added results sorting
![Screenshot_added_sorts](https://github.com/user-attachments/assets/d81ee4ec-cbeb-489a-b514-64803a9144cc)

## v1.0.0 Added git commands results store in Solr
![Screenshot_solr_search](https://github.com/user-attachments/assets/d2f79d75-1662-4755-91e1-eff3b6f0710c)

![Screenshot_solr_admin](https://github.com/user-attachments/assets/d3389d33-c866-45eb-84ce-dfb28359394f)

## Solr
Execution results are stored in Solr search server. 

```cmd
npm install solr-client 
```

```cmd
bin\solr.cmd start 
```

Make new Solr core "vscodegit", do schema and solrconfig [config](/vscode/vscode-git-kafka/config)

Now You have set up vscode-git-kafka extension!

## v1.1.0 Added git log command
![Screenshot_git_log](https://github.com/user-attachments/assets/2e2ac73d-7a10-4475-a3cf-b4cac7c0f33b)

