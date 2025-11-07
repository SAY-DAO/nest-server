import { MigrationInterface, QueryRunner } from "typeorm";

export class New1760555165583 implements MigrationInterface {
    name = 'New1760555165583'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."checkpoint_type_enum" RENAME TO "checkpoint_type_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."checkpoint_type_enum" AS ENUM('feature', 'bug-fix', 'hotfix', 'deploy', 'rollback', 'db-migration', 'code-review', 'performance', 'roadmap', 'research', 'testing', 'design', 'content', 'campaign', 'experiment', 'support', 'onboarding', 'partners', 'incident', 'monitor', 'backup', 'security', 'config', 'automation', 'legal', 'finance', 'hr', 'meeting', 'training', 'registered', 'left', 'joined', 'report')`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "type" TYPE "public"."checkpoint_type_enum" USING "type"::"text"::"public"."checkpoint_type_enum"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "type" SET DEFAULT 'feature'`);
        await queryRunner.query(`DROP TYPE "public"."checkpoint_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '"2025-10-15T19:06:06.086Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '2025-10-15 13:25:59.458+03:30'`);
        await queryRunner.query(`CREATE TYPE "public"."checkpoint_type_enum_old" AS ENUM('feature', 'bug-fix', 'hotfix', 'deploy', 'rollback', 'db-migration', 'code-review', 'performance', 'roadmap', 'spec', 'research', 'testing', 'design', 'assets', 'content', 'social', 'campaign', 'experiment', 'support', 'onboarding', 'partners', 'incident', 'monitor', 'backup', 'security', 'config', 'automation', 'legal', 'finance', 'hr', 'meeting', 'training', 'joined', 'report')`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "type" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "type" TYPE "public"."checkpoint_type_enum_old" USING "type"::"text"::"public"."checkpoint_type_enum_old"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "type" SET DEFAULT 'feature'`);
        await queryRunner.query(`DROP TYPE "public"."checkpoint_type_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."checkpoint_type_enum_old" RENAME TO "checkpoint_type_enum"`);
    }

}
