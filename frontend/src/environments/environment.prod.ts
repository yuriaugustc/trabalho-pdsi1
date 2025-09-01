const acceptedExtensions = [
  '.exe',       // Executável do Windows
  '.msi',       // Instalador Microsoft Windows
  '.zip',       // Arquivo compactado (geralmente usado em todas as plataformas)
  '.rar',       // Arquivo compactado RAR
  '.7z',        // Arquivo compactado 7-Zip
  '.appx',      // Pacote de aplicativo do Windows (UWP)
  '.msix',      // Novo formato de pacote de aplicativo do Windows
  '.dmg',       // Apple Disk Image (macOS)
  '.pkg',       // Pacote instalador do macOS
  '.deb',       // Pacote Debian/Ubuntu (Linux)
  '.rpm',       // Pacote Red Hat/Fedora (Linux)
  '.AppImage',  // Formato universal de aplicativo Linux
  '.tar.gz',    // Arquivo tar GZ (Linux)
  '.tgz',       // Atalho para .tar.gz (Linux)
  '.tar.bz2',   // Arquivo tar BZ2 (Linux)
  '.tar.xz'     // Arquivo tar XZ (Linux)
];

export const environment = {
  acceptedExtensions,
  domain: 'localhost:7109',
  apiUrl: 'https://localhost:7109/api/v1',
  themeLocalKey: 'config',
  jwtSessionKey: 'access_token',
  routerSwitch: 'route-to',
  production: true,
  localDbName: 'empregUfuMock'
};
