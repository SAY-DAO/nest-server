import { MigrationInterface, QueryRunner } from "typeorm";

export class New1721217801774 implements MigrationInterface {
    name = 'New1721217801774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_903eafd5f6dc9f1179d176d437" ON "children_pre_register_entity" ("flaskChildId") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_903eafd5f6dc9f1179d176d437"`);
    }

}
