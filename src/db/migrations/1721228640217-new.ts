import { MigrationInterface, QueryRunner } from "typeorm";

export class New1721228640217 implements MigrationInterface {
    name = 'New1721228640217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_entity" ADD "state" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "children_entity" DROP COLUMN "state"`);
    }

}
