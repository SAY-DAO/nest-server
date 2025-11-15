import { MigrationInterface, QueryRunner } from "typeorm";

export class New1763193231978 implements MigrationInterface {
    name = 'New1763193231978'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."checkpoint_type_enum"`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '"2025-11-15T07:53:52.425Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checkpoint" ALTER COLUMN "checkPointDate" SET DEFAULT '2025-10-15 22:36:06.086+03:30'`);
        await queryRunner.query(`CREATE TYPE "public"."checkpoint_type_enum" AS ENUM('feature', 'bug-fix', 'hotfix', 'deploy', 'rollback', 'db-migration', 'code-review', 'performance', 'roadmap', 'research', 'testing', 'design', 'content', 'campaign', 'experiment', 'support', 'onboarding', 'partners', 'incident', 'monitor', 'backup', 'security', 'config', 'automation', 'legal', 'finance', 'hr', 'meeting', 'training', 'registered', 'left', 'joined', 'report')`);
        await queryRunner.query(`ALTER TABLE "checkpoint" ADD "type" "public"."checkpoint_type_enum" NOT NULL DEFAULT 'feature'`);
    }

}
