# Japan Azure Integration Support Blog

Japan Azure Integration Support Team のブログリポジトリです。

## Getting Started

[Getting Started](./docs/getting-started.md)

## Init / Update blog theme

https://github.com/jpazureid/hexo-theme-jpazure

```shell
git submodule update -i
```

## Start / Stop Hexo server (local-preview)

```shell
docker-compose up

# Ctrl+C
docker-compose down
```

## Writing the blog in devcontainer

If you want to write a blog in devcontainer, install Visual Studio Code and [Dev Container Extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

After that, open the repository with Visual Studio Code and select `Reopen in Container` from the command palette.

In Dev Container, you can start the Hexo server just push `F5` key. (or select `Run and Debug` from the command palette)

You can also use Dev Container experience in GitHub Codespaces. After deploying, go to your own blog repository (`https://github.com/jpazinteg/blog`) and select `Code` -> `Codespaces` -> `Create codespace on main` from the menu.

## Directory structure

```
jpazinteg-blog
├── .azuredevops
│   └── pull_request_template  # PR templates
│       ├── add.md
│       └── fix.md
├── .devcontainer
│   ├── devcontainer.json      # Dev Container configuration
│   └── docker-compose.yml
├── .gitignore
├── .textlintrc
├── postCreateCommand.sh       # script invoked when devcontainer is created
├── README.md
├── _config.yml                # Site configuration
├── articles                   # Blog articles
│   └── information
│       └── test.md            # Example post
├── docker-compose.yaml        # Configuration for containers (local-preview)
├── docs                       # Documents
├── github-issue-template.md
├── pipelines                  # Azure Pipelines
│   ├── prod-pipeline.yml
│   ├── pr-pipeline.yml
│   ├── stages
│   │   ├── generate-blog.yml
│   │   └── publish-to-ghpages.yml
│   └── scripts
│       └── prepare-preview.js
├── scaffolds
├── source
│   ├── LICENSE.md
│   └── SECURITY.md
└── themes                     # Blog themes
    └── jpazure (git submodule)
```
