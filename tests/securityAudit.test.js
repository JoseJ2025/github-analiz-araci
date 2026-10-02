import { describe, it, expect } from 'vitest';
import { detectLicense, auditHygiene, evaluateMaintenanceHealth, runSecurityAudit } from '../src/securityAudit.js';

describe('securityAudit', () => {
  describe('detectLicense', () => {
    it('should detect MIT license', () => {
      const licenseText = 'MIT License\n\nCopyright (c) 2026\n\nPermission is hereby granted, free of charge...';
      const result = detectLicense(['LICENSE'], (path) => licenseText);

      expect(result.spdxId).toBe('MIT');
      expect(result.commercialUseAllowed).toBe(true);
      expect(result.type).toBe('Permissive');
    });

    it('should detect Apache-2.0 license', () => {
      const licenseText = 'Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/';
      const result = detectLicense(['LICENSE.txt'], (path) => licenseText);

      expect(result.spdxId).toBe('Apache-2.0');
      expect(result.commercialUseAllowed).toBe(true);
      expect(result.type).toBe('Permissive');
    });

    it('should detect GPL-3.0 copyleft license', () => {
      const licenseText = 'GNU GENERAL PUBLIC LICENSE\nVersion 3, 29 June 2007';
      const result = detectLicense(['LICENSE'], (path) => licenseText);

      expect(result.spdxId).toBe('GPL-3.0');
      expect(result.type).toBe('Copyleft');
    });

    it('should report Unlicensed when no license file exists', () => {
      const result = detectLicense(['src/index.js'], () => '');
      expect(result.spdxId).toBe('NOASSERTION');
      expect(result.commercialUseAllowed).toBe(false);
    });
  });

  describe('auditHygiene', () => {
    it('should detect sensitive files committed by mistake', () => {
      const files = ['src/index.js', '.env', 'certs/server.key', 'id_rsa'];
      const leaks = auditHygiene(files);

      expect(leaks.hasIssues).toBe(true);
      expect(leaks.sensitiveFiles).toContain('.env');
      expect(leaks.sensitiveFiles).toContain('certs/server.key');
      expect(leaks.sensitiveFiles).toContain('id_rsa');
    });

    it('should pass when repository is clean', () => {
      const files = ['src/index.js', 'package.json', 'README.md'];
      const leaks = auditHygiene(files);

      expect(leaks.hasIssues).toBe(false);
      expect(leaks.sensitiveFiles.length).toBe(0);
    });

    it('should detect in-content secrets when readFile is provided', () => {
      const files = ['src/config.js'];
      const readFile = () => 'const apiKey = "sk-proj-abcdef1234567890abcdef1234567890abcdef1234567890";';
      const leaks = auditHygiene(files, readFile);

      expect(leaks.hasIssues).toBe(true);
      expect(leaks.exposedSecrets.length).toBe(1);
      expect(leaks.exposedSecrets[0].type).toBe('OpenAI API Key');
    });
  });

  describe('evaluateMaintenanceHealth', () => {
    it('should classify recent commits as Active', () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const health = evaluateMaintenanceHealth(recentDate);

      expect(health.status).toBe('Active');
    });

    it('should classify commits older than 1 year as Abandoned', () => {
      const oldDate = '2023-01-01T00:00:00Z';
      const health = evaluateMaintenanceHealth(oldDate);

      expect(health.status).toBe('Abandoned');
    });
  });

  describe('runSecurityAudit', () => {
    it('should produce unified security audit report', () => {
      const files = ['LICENSE', 'src/index.js'];
      const readFile = () => 'MIT License\nPermission is hereby granted...';
      const lastCommitDate = new Date().toISOString();

      const audit = runSecurityAudit(files, readFile, lastCommitDate);
      expect(audit.license.spdxId).toBe('MIT');
      expect(audit.hygiene.hasIssues).toBe(false);
      expect(audit.health.status).toBe('Active');
    });
  });
});
