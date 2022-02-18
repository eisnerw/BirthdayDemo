# Generate

```bash
dotnet restore
npm install -g generator-jhipster
npm install -g yo
npm install generator-jhipster@7.1.0
npm i -g generator-jhipster-dotnetcore
jhipster --blueprints dotnetcore
change <TargetFramework>net5.0 changes to <TargetFramework>net6.0

NOTE: Delete dotnetcore.csproj and Program.cs files after the generation
```

## Generate jdl:
```bash
jhipster import-jdl app.jdl
```

## Debugging (launch.json)
```bash
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
    
        {
            "name": ".NET Core Launch (web)",
            "type": "coreclr",
            "request": "launch",
            "justMyCode": false,
            "preLaunchTask": "build",
            "program": "${workspaceFolder}/src/BirthdayDemo/bin/Debug/net6.0/birthday-demo.dll",
            "args": [],
            "cwd": "${workspaceFolder}/src/BirthdayDemo",
            "stopAtEntry": false,
            "serverReadyAction": {
                "action": "openExternally",
                "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
            },
            "env": {
                "ASPNETCORE_ENVIRONMENT": "Development"
            },
            "sourceFileMap": {
                "/Views": "${workspaceFolder}/Views"
            }
        },
        {
            "name": ".NET Core Attach",
            "type": "coreclr",
            "request": "attach",
            "processId": "${command:pickProcess}"
        }
    ]
}
```
