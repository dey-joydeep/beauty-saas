# Organize appointment components
$appointmentsDir = "e:\workspace\beauty-saas\bsaas-front\src\app\modules\salon\components\appointments"

# Move create appointment files
Move-Item -Path "$appointmentsDir\appointment-create.*" -Destination "$appointmentsDir\create\" -Force

# Move salon view appointment files
Move-Item -Path "$appointmentsDir\salon-appointments.*" -Destination "$appointmentsDir\salon-view\" -Force

# Move user view appointment files
Move-Item -Path "$appointmentsDir\user-appointments.*" -Destination "$appointmentsDir\user-view\" -Force

# Update file names to be more specific
Rename-Item -Path "$appointmentsDir\create\appointment-create.component.ts" -NewName "create-appointment.component.ts" -Force
Rename-Item -Path "$appointmentsDir\create\appointment-create.component.html" -NewName "create-appointment.component.html" -Force
Rename-Item -Path "$appointmentsDir\create\appointment-create.component.scss" -NewName "create-appointment.component.scss" -Force
Rename-Item -Path "$appointmentsDir\create\appointment-create.component.spec.ts" -NewName "create-appointment.component.spec.ts" -Force

Rename-Item -Path "$appointmentsDir\salon-view\salon-appointments.component.ts" -NewName "salon-appointments.component.ts" -Force
Rename-Item -Path "$appointmentsDir\salon-view\salon-appointments.component.html" -NewName "salon-appointments.component.html" -Force
Rename-Item -Path "$appointmentsDir\salon-view\salon-appointments.component.scss" -NewName "salon-appointments.component.scss" -Force

Rename-Item -Path "$appointmentsDir\user-view\user-appointments.component.ts" -NewName "user-appointments.component.ts" -Force
Rename-Item -Path "$appointmentsDir\user-view\user-appointments.component.html" -NewName "user-appointments.component.html" -Force
Rename-Item -Path "$appointmentsDir\user-view\user-appointments.component.scss" -NewName "user-appointments.component.scss" -Force

Write-Host "Appointment components have been organized successfully!"
