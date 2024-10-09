# vscode-git-kafka
Visual Studio Code extension to invoke git commands and store results in SOLR search index server

Git is great version control system with good commands in scripts. Visual Studio extension to publish commands results in windows UI and and store results in SOLR search index server.

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
