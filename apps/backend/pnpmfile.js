function readPackage(pkg, context) {
  // Override peer dependencies for nestjs-trpc to accept NestJS 11
  if (pkg.name === 'nestjs-trpc') {
    pkg.peerDependencies = {
      ...pkg.peerDependencies,
      '@nestjs/common': '^9.3.8 || ^10.0.0 || ^11.0.0',
      '@nestjs/core': '^9.3.8 || ^10.0.0 || ^11.0.0'
    }
  }
  
  return pkg
}

module.exports = {
  hooks: {
    readPackage
  }
}
