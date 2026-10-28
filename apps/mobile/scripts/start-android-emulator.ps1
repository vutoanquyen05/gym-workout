$ErrorActionPreference = 'Stop'

$avdName = 'Medium_Phone_API_37.0'
$sdkRoot = $env:ANDROID_HOME
if (-not $sdkRoot) {
  $sdkRoot = $env:ANDROID_SDK_ROOT
}
if (-not $sdkRoot) {
  $sdkRoot = Join-Path $env:LOCALAPPDATA 'Android\Sdk'
}

$adb = Join-Path $sdkRoot 'platform-tools\adb.exe'
$emulator = Join-Path $sdkRoot 'emulator\emulator.exe'
foreach ($tool in @($adb, $emulator)) {
  if (-not (Test-Path $tool)) {
    throw "Android tool not found: $tool. Set ANDROID_HOME to your Android SDK directory."
  }
}

$serial = $null
foreach ($device in @(& $adb devices | Select-String '^emulator-\d+\s+device$')) {
  $candidate = ($device.Line -split '\s+')[0]
  $avd = (& $adb -s $candidate emu avd name 2>$null) -join "`n"
  if ($avd -match [regex]::Escape($avdName)) {
    $serial = $candidate
    break
  }
}

if (-not $serial) {
  $initialSerials = @(& $adb devices | Select-String '^emulator-\d+\s+' | ForEach-Object { ($_ -split '\s+')[0] })
  $bootProcess = Start-Process -FilePath $emulator -ArgumentList @('-avd', $avdName, '-no-boot-anim') -PassThru
  $deadline = (Get-Date).AddMinutes(3)

  while (-not $serial -and (Get-Date) -lt $deadline) {
    $devices = @(& $adb devices | Select-String '^emulator-\d+\s+device$')
    foreach ($device in $devices) {
      $candidate = ($device.Line -split '\s+')[0]
      if ($candidate -notin $initialSerials) {
        $serial = $candidate
        break
      }
    }
    if (-not $serial -and $bootProcess.HasExited) {
      throw "Emulator process exited before $avdName became available."
    }
    Start-Sleep -Seconds 2
  }

  if (-not $serial) {
    throw "Timed out waiting for $avdName to connect to ADB."
  }
}

$deadline = (Get-Date).AddMinutes(3)
while ((Get-Date) -lt $deadline) {
  $bootCompleted = & $adb -s $serial shell getprop sys.boot_completed
  if ($bootCompleted -match '1') {
    Write-Output "$avdName is ready on $serial."
    exit 0
  }
  Start-Sleep -Seconds 2
}

throw "Timed out waiting for Android to finish booting on $serial."
