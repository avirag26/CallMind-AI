$modules = @("auth", "users", "organizations", "doctors", "patients", "calls", "ai", "notifications", "dashboard", "health", "common", "config", "database", "queue")

foreach ($m in $modules) {
    Write-Host "Generating module $m"
    npx nest g module modules/$m --no-spec
    npx nest g controller modules/$m --no-spec
    npx nest g service modules/$m --no-spec
    
    $dir = "src/modules/$m"
    New-Item -ItemType Directory -Force -Path "$dir/repositories"
    New-Item -ItemType Directory -Force -Path "$dir/dtos"
    New-Item -ItemType Directory -Force -Path "$dir/entities"
    New-Item -ItemType Directory -Force -Path "$dir/interfaces"
}
