IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
BEGIN
    CREATE TABLE [__EFMigrationsHistory] (
        [MigrationId] nvarchar(150) NOT NULL,
        [ProductVersion] nvarchar(32) NOT NULL,
        CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
    );
END;
GO

BEGIN TRANSACTION;
IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Clinics] (
        [ClinicId] int NOT NULL IDENTITY,
        [ClinicName] nvarchar(150) NOT NULL,
        [Specialty] nvarchar(100) NOT NULL,
        [Address] nvarchar(255) NOT NULL,
        [Phone] nvarchar(30) NOT NULL,
        [Email] nvarchar(150) NOT NULL,
        [WorkingHours] nvarchar(255) NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Clinics] PRIMARY KEY ([ClinicId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Roles] (
        [RoleId] int NOT NULL IDENTITY,
        [RoleName] nvarchar(50) NOT NULL,
        CONSTRAINT [PK_Roles] PRIMARY KEY ([RoleId])
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Users] (
        [UserId] int NOT NULL IDENTITY,
        [Email] nvarchar(150) NOT NULL,
        [PasswordHash] nvarchar(255) NOT NULL,
        [Phone] nvarchar(20) NOT NULL,
        [RoleId] int NOT NULL,
        [IsActive] bit NOT NULL DEFAULT CAST(1 AS bit),
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Users] PRIMARY KEY ([UserId]),
        CONSTRAINT [FK_Users_Roles_RoleId] FOREIGN KEY ([RoleId]) REFERENCES [Roles] ([RoleId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Doctors] (
        [DoctorId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [FullName] nvarchar(150) NOT NULL,
        [Specialty] nvarchar(100) NOT NULL,
        [LicenseNumber] nvarchar(100) NOT NULL,
        [Phone] nvarchar(30) NOT NULL,
        [Email] nvarchar(150) NOT NULL,
        CONSTRAINT [PK_Doctors] PRIMARY KEY ([DoctorId]),
        CONSTRAINT [FK_Doctors_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Notifications] (
        [NotificationId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Message] nvarchar(max) NOT NULL,
        [Type] nvarchar(30) NOT NULL,
        [IsRead] bit NOT NULL DEFAULT CAST(0 AS bit),
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Notifications] PRIMARY KEY ([NotificationId]),
        CONSTRAINT [FK_Notifications_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Patients] (
        [PatientId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [UnifiedPatientId] nvarchar(30) NOT NULL,
        [FullName] nvarchar(150) NOT NULL,
        [DateOfBirth] date NOT NULL,
        [Gender] nvarchar(10) NOT NULL,
        [Address] nvarchar(255) NULL,
        [EmergencyContact] nvarchar(100) NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Patients] PRIMARY KEY ([PatientId]),
        CONSTRAINT [FK_Patients_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Receptionists] (
        [ReceptionistId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [ClinicId] int NOT NULL,
        [FullName] nvarchar(150) NOT NULL,
        CONSTRAINT [PK_Receptionists] PRIMARY KEY ([ReceptionistId]),
        CONSTRAINT [FK_Receptionists_Clinics_ClinicId] FOREIGN KEY ([ClinicId]) REFERENCES [Clinics] ([ClinicId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Receptionists_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [ClinicDoctors] (
        [ClinicDoctorId] int NOT NULL IDENTITY,
        [ClinicId] int NOT NULL,
        [DoctorId] int NOT NULL,
        [JoinedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [Status] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_ClinicDoctors] PRIMARY KEY ([ClinicDoctorId]),
        CONSTRAINT [FK_ClinicDoctors_Clinics_ClinicId] FOREIGN KEY ([ClinicId]) REFERENCES [Clinics] ([ClinicId]) ON DELETE CASCADE,
        CONSTRAINT [FK_ClinicDoctors_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([DoctorId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [AccessPermissions] (
        [AccessPermissionId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [DoctorId] int NULL,
        [ClinicId] int NULL,
        [AccessType] nvarchar(30) NOT NULL,
        [GrantedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [ExpiresAt] datetime2 NULL,
        [Status] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_AccessPermissions] PRIMARY KEY ([AccessPermissionId]),
        CONSTRAINT [FK_AccessPermissions_Clinics_ClinicId] FOREIGN KEY ([ClinicId]) REFERENCES [Clinics] ([ClinicId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AccessPermissions_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([DoctorId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_AccessPermissions_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Allergies] (
        [AllergyId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [AllergyName] nvarchar(150) NOT NULL,
        [Reaction] nvarchar(255) NOT NULL,
        [Notes] nvarchar(max) NULL,
        CONSTRAINT [PK_Allergies] PRIMARY KEY ([AllergyId]),
        CONSTRAINT [FK_Allergies_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Appointments] (
        [AppointmentId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [DoctorId] int NOT NULL,
        [ClinicId] int NOT NULL,
        [AppointmentDate] date NOT NULL,
        [StartTime] time NOT NULL,
        [EndTime] time NOT NULL,
        [Status] nvarchar(20) NOT NULL,
        [Notes] nvarchar(max) NULL,
        CONSTRAINT [PK_Appointments] PRIMARY KEY ([AppointmentId]),
        CONSTRAINT [FK_Appointments_Clinics_ClinicId] FOREIGN KEY ([ClinicId]) REFERENCES [Clinics] ([ClinicId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Appointments_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([DoctorId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Appointments_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [AuditLogs] (
        [AuditLogId] int NOT NULL IDENTITY,
        [UserId] int NOT NULL,
        [PatientId] int NULL,
        [Action] nvarchar(100) NOT NULL,
        [EntityName] nvarchar(100) NOT NULL,
        [EntityId] int NULL,
        [Timestamp] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [IPAddress] nvarchar(45) NOT NULL,
        CONSTRAINT [PK_AuditLogs] PRIMARY KEY ([AuditLogId]),
        CONSTRAINT [FK_AuditLogs_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE SET NULL,
        CONSTRAINT [FK_AuditLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([UserId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [EmergencyProfiles] (
        [EmergencyProfileId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [BloodType] nvarchar(15) NOT NULL,
        [EmergencyNotes] nvarchar(max) NULL,
        [EmergencyContactName] nvarchar(150) NOT NULL,
        [EmergencyContactPhone] nvarchar(30) NOT NULL,
        [LastUpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_EmergencyProfiles] PRIMARY KEY ([EmergencyProfileId]),
        CONSTRAINT [FK_EmergencyProfiles_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [MedicalRecords] (
        [MedicalRecordId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [CreatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [LastUpdatedAt] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_MedicalRecords] PRIMARY KEY ([MedicalRecordId]),
        CONSTRAINT [FK_MedicalRecords_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Medications] (
        [MedicationId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [MedicationName] nvarchar(200) NOT NULL,
        [Dosage] nvarchar(100) NOT NULL,
        [Frequency] nvarchar(100) NOT NULL,
        [StartDate] date NOT NULL,
        [EndDate] date NULL,
        [Notes] nvarchar(max) NULL,
        CONSTRAINT [PK_Medications] PRIMARY KEY ([MedicationId]),
        CONSTRAINT [FK_Medications_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Visits] (
        [VisitId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [DoctorId] int NOT NULL,
        [ClinicId] int NOT NULL,
        [VisitDate] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [ChiefComplaint] nvarchar(max) NOT NULL,
        [Notes] nvarchar(max) NULL,
        [Status] nvarchar(30) NOT NULL,
        CONSTRAINT [PK_Visits] PRIMARY KEY ([VisitId]),
        CONSTRAINT [FK_Visits_Clinics_ClinicId] FOREIGN KEY ([ClinicId]) REFERENCES [Clinics] ([ClinicId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Visits_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([DoctorId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Visits_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE NO ACTION
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Diagnoses] (
        [DiagnosisId] int NOT NULL IDENTITY,
        [VisitId] int NOT NULL,
        [DiagnosisName] nvarchar(200) NOT NULL,
        [Description] nvarchar(max) NULL,
        [DiagnosisDate] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        CONSTRAINT [PK_Diagnoses] PRIMARY KEY ([DiagnosisId]),
        CONSTRAINT [FK_Diagnoses_Visits_VisitId] FOREIGN KEY ([VisitId]) REFERENCES [Visits] ([VisitId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [FollowUps] (
        [FollowUpId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [DoctorId] int NOT NULL,
        [VisitId] int NOT NULL,
        [FollowUpDate] date NOT NULL,
        [Notes] nvarchar(max) NULL,
        [Status] nvarchar(20) NOT NULL,
        CONSTRAINT [PK_FollowUps] PRIMARY KEY ([FollowUpId]),
        CONSTRAINT [FK_FollowUps_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([DoctorId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_FollowUps_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_FollowUps_Visits_VisitId] FOREIGN KEY ([VisitId]) REFERENCES [Visits] ([VisitId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Prescriptions] (
        [PrescriptionId] int NOT NULL IDENTITY,
        [VisitId] int NOT NULL,
        [DoctorId] int NOT NULL,
        [PatientId] int NOT NULL,
        [PrescriptionDate] datetime2 NOT NULL DEFAULT (GETUTCDATE()),
        [Notes] nvarchar(max) NULL,
        CONSTRAINT [PK_Prescriptions] PRIMARY KEY ([PrescriptionId]),
        CONSTRAINT [FK_Prescriptions_Doctors_DoctorId] FOREIGN KEY ([DoctorId]) REFERENCES [Doctors] ([DoctorId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Prescriptions_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE NO ACTION,
        CONSTRAINT [FK_Prescriptions_Visits_VisitId] FOREIGN KEY ([VisitId]) REFERENCES [Visits] ([VisitId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Scans] (
        [ScanId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [VisitId] int NULL,
        [ScanType] nvarchar(150) NOT NULL,
        [ScanDate] date NOT NULL,
        [Result] nvarchar(max) NULL,
        [FileUrl] nvarchar(500) NULL,
        [Notes] nvarchar(max) NULL,
        CONSTRAINT [PK_Scans] PRIMARY KEY ([ScanId]),
        CONSTRAINT [FK_Scans_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE CASCADE,
        CONSTRAINT [FK_Scans_Visits_VisitId] FOREIGN KEY ([VisitId]) REFERENCES [Visits] ([VisitId]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Tests] (
        [TestId] int NOT NULL IDENTITY,
        [PatientId] int NOT NULL,
        [VisitId] int NULL,
        [TestName] nvarchar(200) NOT NULL,
        [TestDate] date NOT NULL,
        [Result] nvarchar(max) NULL,
        [Notes] nvarchar(max) NULL,
        [FileUrl] nvarchar(500) NULL,
        CONSTRAINT [PK_Tests] PRIMARY KEY ([TestId]),
        CONSTRAINT [FK_Tests_Patients_PatientId] FOREIGN KEY ([PatientId]) REFERENCES [Patients] ([PatientId]) ON DELETE CASCADE,
        CONSTRAINT [FK_Tests_Visits_VisitId] FOREIGN KEY ([VisitId]) REFERENCES [Visits] ([VisitId]) ON DELETE SET NULL
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [Treatments] (
        [TreatmentId] int NOT NULL IDENTITY,
        [VisitId] int NOT NULL,
        [TreatmentDescription] nvarchar(max) NOT NULL,
        [StartDate] date NOT NULL,
        [EndDate] date NULL,
        [Instructions] nvarchar(max) NULL,
        CONSTRAINT [PK_Treatments] PRIMARY KEY ([TreatmentId]),
        CONSTRAINT [FK_Treatments_Visits_VisitId] FOREIGN KEY ([VisitId]) REFERENCES [Visits] ([VisitId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE TABLE [PrescriptionItems] (
        [PrescriptionItemId] int NOT NULL IDENTITY,
        [PrescriptionId] int NOT NULL,
        [MedicationName] nvarchar(200) NOT NULL,
        [Dosage] nvarchar(100) NOT NULL,
        [Frequency] nvarchar(100) NOT NULL,
        [Duration] nvarchar(100) NOT NULL,
        [Instructions] nvarchar(max) NULL,
        CONSTRAINT [PK_PrescriptionItems] PRIMARY KEY ([PrescriptionItemId]),
        CONSTRAINT [FK_PrescriptionItems_Prescriptions_PrescriptionId] FOREIGN KEY ([PrescriptionId]) REFERENCES [Prescriptions] ([PrescriptionId]) ON DELETE CASCADE
    );
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoleId', N'RoleName') AND [object_id] = OBJECT_ID(N'[Roles]'))
        SET IDENTITY_INSERT [Roles] ON;
    EXEC(N'INSERT INTO [Roles] ([RoleId], [RoleName])
    VALUES (1, N''Patient''),
    (2, N''Doctor''),
    (3, N''Receptionist''),
    (4, N''ClinicAdmin''),
    (5, N''SystemAdmin'')');
    IF EXISTS (SELECT * FROM [sys].[identity_columns] WHERE [name] IN (N'RoleId', N'RoleName') AND [object_id] = OBJECT_ID(N'[Roles]'))
        SET IDENTITY_INSERT [Roles] OFF;
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AccessPermissions_ClinicId] ON [AccessPermissions] ([ClinicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AccessPermissions_DoctorId] ON [AccessPermissions] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AccessPermissions_Lookup] ON [AccessPermissions] ([PatientId], [DoctorId], [Status], [ExpiresAt]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Allergies_PatientId] ON [Allergies] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Appointments_Clinic_Doctor_Date] ON [Appointments] ([ClinicId], [DoctorId], [AppointmentDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Appointments_DoctorId] ON [Appointments] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Appointments_PatientId] ON [Appointments] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_PatientId] ON [AuditLogs] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_Timestamp] ON [AuditLogs] ([Timestamp]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_AuditLogs_UserId] ON [AuditLogs] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_ClinicDoctors_ClinicId_DoctorId] ON [ClinicDoctors] ([ClinicId], [DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_ClinicDoctors_DoctorId] ON [ClinicDoctors] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Diagnoses_VisitId] ON [Diagnoses] ([VisitId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Doctors_LicenseNumber] ON [Doctors] ([LicenseNumber]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Doctors_UserId] ON [Doctors] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_EmergencyProfiles_PatientId] ON [EmergencyProfiles] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_FollowUps_DoctorId] ON [FollowUps] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_FollowUps_PatientId] ON [FollowUps] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_FollowUps_VisitId] ON [FollowUps] ([VisitId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_MedicalRecords_PatientId] ON [MedicalRecords] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Medications_PatientId] ON [Medications] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Notifications_UserId] ON [Notifications] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Patients_FullName] ON [Patients] ([FullName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Patients_UnifiedId] ON [Patients] ([UnifiedPatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Patients_UserId] ON [Patients] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_PrescriptionItems_PrescriptionId] ON [PrescriptionItems] ([PrescriptionId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Prescriptions_DoctorId] ON [Prescriptions] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Prescriptions_PatientId] ON [Prescriptions] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Prescriptions_VisitId] ON [Prescriptions] ([VisitId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Receptionists_ClinicId] ON [Receptionists] ([ClinicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Receptionists_UserId] ON [Receptionists] ([UserId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Roles_RoleName] ON [Roles] ([RoleName]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Scans_PatientId] ON [Scans] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Scans_VisitId] ON [Scans] ([VisitId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Tests_PatientId] ON [Tests] ([PatientId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Tests_VisitId] ON [Tests] ([VisitId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Treatments_VisitId] ON [Treatments] ([VisitId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Email] ON [Users] ([Email]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE UNIQUE INDEX [IX_Users_Phone] ON [Users] ([Phone]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Users_RoleId] ON [Users] ([RoleId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Visits_ClinicId] ON [Visits] ([ClinicId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Visits_DoctorId] ON [Visits] ([DoctorId]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    CREATE INDEX [IX_Visits_Patient_Date] ON [Visits] ([PatientId], [VisitDate]);
END;

IF NOT EXISTS (
    SELECT * FROM [__EFMigrationsHistory]
    WHERE [MigrationId] = N'20261102200538_InitialCreate'
)
BEGIN
    INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
    VALUES (N'20261102200538_InitialCreate', N'9.0.0');
END;

COMMIT;
GO

