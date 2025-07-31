# Organize auth module files
$authDir = "e:\workspace\beauty-saas\bsaas-front\src\app\core\auth"

# Move auth guard files
Move-Item -Path "$authDir\auth.guard.*" -Destination "$authDir\guards\" -Force

# Move services
Move-Item -Path "$authDir\auth.service.ts" -Destination "$authDir\services\" -Force
Move-Item -Path "$authDir\current-user.service.ts" -Destination "$authDir\services\" -Force

# Move base files
Move-Item -Path "$authDir\base\*" -Destination "$authDir\services\base\" -Force
Remove-Item -Path "$authDir\base" -Recurse -Force

# Move models/interfaces
Move-Item -Path "$authDir\auth-params.model.ts" -Destination "$authDir\interfaces\" -Force
Move-Item -Path "$authDir\models\*" -Destination "$authDir\interfaces\" -Force
Remove-Item -Path "$authDir\models" -Recurse -Force

# Organize components
# Login
Move-Item -Path "$authDir\login\*" -Destination "$authDir\components\login\" -Force
Remove-Item -Path "$authDir\login" -Recurse -Force
Move-Item -Path "$authDir\login.component.*" -Destination "$authDir\components\login\" -Force 2>$null

# Register
Move-Item -Path "$authDir\register\*" -Destination "$authDir\components\register\" -Force
Remove-Item -Path "$authDir\register" -Recurse -Force
Move-Item -Path "$authDir\register.component.*" -Destination "$authDir\components\register\" -Force 2>$null

# Forgot Password
Move-Item -Path "$authDir\forgot-password\*" -Destination "$authDir\components\forgot-password\" -Force
Remove-Item -Path "$authDir\forgot-password" -Recurse -Force
Move-Item -Path "$authDir\forgot-password.component.*" -Destination "$authDir\components\forgot-password\" -Force 2>$null

# Update component file names to match directory structure
Rename-Item -Path "$authDir\components\login\login.component.ts" -NewName "login.component.ts" -Force
Rename-Item -Path "$authDir\components\register\register.component.ts" -NewName "register.component.ts" -Force
Rename-Item -Path "$authDir\components\forgot-password\forgot-password.component.ts" -NewName "forgot-password.component.ts" -Force

Write-Host "Auth module files have been organized successfully!"
