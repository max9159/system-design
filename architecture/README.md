# Sequence Diagrams<!-- omit in toc -->
<!-- table of content -->
- [Abstract](#abstract)
- [C4 Context Diagram of Jenkins and Git Repositories](#c4-context-diagram-of-jenkins-and-git-repositories)
- [`Draw.io` - eCommerceWebSite System Design v1](#drawio---ecommercewebsite-system-design-v1)
  - [`draw.io` Source](#drawio-source)
  - [`draw.io` HTML Preview (Offline)](#drawio-html-preview-offline)
  - [`draw.io` Online Preview](#drawio-online-preview)

## Abstract
> This document provides a detailed overview of the system architecture, emphasizing the use of `mermaid` and `draw.io` for visual representation. 

## C4 Context Diagram of Jenkins and Git Repositories
> The `mermaid` diagrams illustrate the `C4 context diagram` of `Jenkins` and `Git repositories`, showcasing the interactions and relationships between various components. 


```mermaid
C4Context
    title Component Diagram of Jenkins and Git Repositories
    Person(jenkins_user, "User", "Use Jenkins")
    Enterprise_Boundary(PROD_Env, "PROD Environment") {
        System_Boundary(PRODJks, "CD of Jenkins") {
            Container(cr_jenkins_prod_db, "PROD Jenkins", "Deploy PROD")
            Container(cr_jenkins_uat_db, "UAT Jenkins", "Deploy UAT")
        }
    }
    Enterprise_Boundary(Department_Office, "Department Office Environment") {
        Container_Boundary(gitrepoSource, "Git Repo (Source Code)") {
            Component(git_repo_db_source, "database", "DB Package Sources")
        }

        Container_Boundary(jenkins_r_uat_prod, "CI of Jenkins") {
            Component(jr_uat_db, "UAT.Generatepackage", "Pull/Generate/Push")
            Component(jr_prod_db, "PROD.Generatepackage", "Pull/Generate/Push")
        }
        
        Container_Boundary(gitrepo, "Git Repo (Internal Artifacts)") {
            Component(git_repo_uat_db, "branch uat: artifacts", "DB Artifacts")
            Component(git_repo_prod_db, "branch prod: artifacts", "DB Artifacts")
        }
        Container_Boundary(gitrepoCWD, "Git Repo (External Artifacts)") {
            Component_Ext(git_repo_cwd_uat_db, "QualityControl/package_upload/uat", "DB Artifacts")
            Component_Ext(git_repo_cwd_prod_db, "QualityControl/package_upload/prod", "DB Artifacts")
        }
    }


    Rel(jr_uat_db, git_repo_uat_db, "Git Push: Package")
    Rel(jr_uat_db, git_repo_cwd_uat_db, "Git Push: Deployment Guide")
    Rel(jr_uat_db, git_repo_db_source, "Git Pull: Sources")
    Rel(jr_prod_db, git_repo_prod_db, "Git Push: Package")
    Rel(jr_prod_db, git_repo_cwd_prod_db, "Git Push: Deployment Guide")
    Rel(jr_prod_db, git_repo_db_source, "Git Pull: Sources")
    Rel(cr_jenkins_uat_db, git_repo_uat_db, "Git pull: Package")
    Rel(cr_jenkins_prod_db, git_repo_prod_db, "Git pull: Package")
    Rel(jenkins_user, cr_jenkins_uat_db, "Use")
    Rel(jenkins_user, jr_uat_db, "Use")
```

## `Draw.io` - eCommerceWebSite System Design v1
> The `draw.io` diagrams offer a comprehensive view of the system architecture and workflow, aiding in the understanding of deployment pipelines, source code management, and artifact handling within the eCommerce system.


### `draw.io` Source
- [System_Design_C4Model_v1.drawio](./eCommerceWebSite/System_Design_C4Model_v1.drawio)
### `draw.io` HTML Preview (Offline)
- [System_Design_C4Model_v1.html](./eCommerceWebSite/System_Design_C4Model_v1.html)
### `draw.io` Online Preview
- https://viewer.diagrams.net/index.html?tags=%7B%7D&highlight=0000ff&edit=_blank&layers=1&nav=1&title=System_Design_C4Model_v1.drawio#Uhttps%3A%2F%2Fraw.githubusercontent.com%2Fmax9159%2Fsystem-design%2Fmain%2Farchitecture%2FeCommerceWebSite%2FSystem_Design_C4Model_v1.drawio