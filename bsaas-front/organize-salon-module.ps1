# Organize salon module files
$salonDir = "e:\workspace\beauty-saas\bsaas-front\src\app\modules\salon"

# Move component files to their respective directories
# Salon List
Move-Item -Path "$salonDir\salon-list\*" -Destination "$salonDir\components\salon-list\" -Force

# Salon Profile
Move-Item -Path "$salonDir\salon-profile\*" -Destination "$salonDir\components\salon-profile\" -Force
Move-Item -Path "$salonDir\salon-profile.component.*" -Destination "$salonDir\components\salon-profile\" -Force
Rename-Item -Path "$salonDir\components\salon-profile\salon-profile.component.ts" -NewName "salon-profile.component.ts" -Force

# Salon Search
Move-Item -Path "$salonDir\salon-search.component.*" -Destination "$salonDir\components\salon-search\" -Force

# Top Salons
Move-Item -Path "$salonDir\top-salons.component.*" -Destination "$salonDir\components\top-salons\" -Force

# Appointments
Move-Item -Path "$salonDir\appointment-create.component.*" -Destination "$salonDir\components\appointments\" -Force
Move-Item -Path "$salonDir\salon-appointments.component.*" -Destination "$salonDir\components\appointments\" -Force
Move-Item -Path "$salonDir\user-appointments.component.*" -Destination "$salonDir\components\appointments\" -Force

# Staff Request
Move-Item -Path "$salonDir\staff-request-form.component.*" -Destination "$salonDir\components\staff-request\" -Force
Move-Item -Path "$salonDir\staff-request-list.component.*" -Destination "$salonDir\components\staff-request\" -Force

# Services
Move-Item -Path "$salonDir\salon.service.*" -Destination "$salonDir\services\" -Force
Move-Item -Path "$salonDir\service-approval.service.*" -Destination "$salonDir\services\" -Force
Move-Item -Path "$salonDir\staff-management.service.*" -Destination "$salonDir\services\" -Force
Move-Item -Path "$salonDir\staff-request.service.*" -Destination "$salonDir\services\" -Force

# Models
Move-Item -Path "$salonDir\models\*" -Destination "$salonDir\models\" -Force

# Pipes
Move-Item -Path "$salonDir\safe-url.pipe.*" -Destination "$salonDir\pipes\" -Force

Write-Host "Salon module files have been organized successfully!"
