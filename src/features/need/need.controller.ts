import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { NeedService } from './need.service';
import { isAuthenticated } from 'src/utils/auth';
import {
  AnnouncementEnum,
  CategoryEnum,
  Colors,
  FlaskUserTypesEnum,
  NeedTypeEnum,
  ProductStatusEnum,
  SUPER_ADMIN_ID,
} from 'src/types/interfaces/interface';
import config from 'src/config';
import { daysDifference, timeDifference } from 'src/utils/helpers';
import axios from 'axios';
import { NgoService } from '../ngo/ngo.service';
import { format } from 'date-fns';
import { TicketService } from '../ticket/ticket.service';
import {
  checkNeed,
  GRACE_PERIOD,
  SIMILAR_NAME_LIMIT_PRODUCT,
  SIMILAR_NAME_LIMIT_SERVICE,
  validateNeed,
} from 'src/utils/needConfirm';
import { ValidatedDupType } from 'src/types/interfaces/Need';
import { SyncService } from '../sync/sync.service';
import { TicketEntity } from 'src/entities/ticket.entity';
import { ProviderService } from '../provider/provider.service';
import { ServerError } from 'src/filters/server-exception.filter';

const BASE_LIMIT_DUPLICATES_0 = 4; // when confirming a need 4 duplicates are allowed for the category 0
const BASE_LIMIT_DUPLICATES_1 = 3;
const BASE_LIMIT_DUPLICATES_2 = 5;
const BASE_LIMIT_DUPLICATES_3 = 2;

@ApiTags('Needs')
@ApiSecurity('flask-access-token')
@ApiHeader({
  name: 'flaskId',
  description: 'to use cache and flask authentication',
  required: true,
})
@Controller('needs')
export class NeedController {
  constructor(
    private needService: NeedService,
    private userService: UserService,
    private ngoService: NgoService,
    private ticketService: TicketService,
    private syncService: SyncService,
    private providerService: ProviderService,
  ) {}

  @Get(`all`)
  @ApiOperation({ description: 'Get all needs from db 1' })
  async getNeeds(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getNeeds();
  }

  @Get(`:needId`)
  @ApiOperation({ description: 'Get one need' })
  async getANeed(@Req() req: Request, @Param('needId') needId: string) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getNeedById(needId);
  }

  @Get(`flask/random`)
  @ApiOperation({ description: 'Get a random need from flask' })
  async getRandomNeed(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    return await this.needService.getFlaskRandomNeed();
  }

  @Get(`flask/arriving/:code`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskNeedsByDeliveryCode(
    @Req() req: Request,
    @Param('code') code: string,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskNeedsByDeliveryCode(code);
  }

  @Get(`flask/auditedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getFlaskAuditorNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskAuditorNeeds(flaskUserId);
  }

  @Get(`nest/auditedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from nest' })
  async getNestAuditorNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNestAuditorNeeds(flaskUserId);
  }

  @Get(`nest/purchasedBy/:flaskUserId`)
  @ApiOperation({ description: 'Get all done needs from nest' })
  async getNestPurchaserNeeds(
    @Req() req: Request,
    @Param('flaskUserId') flaskUserId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNestPurchaserNeeds(flaskUserId);
  }

  @Get(`flask/:id`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getFlaskNeed(@Req() req: Request, @Param('id') id: number) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getFlaskNeed(id);
  }

  @Get(`one/:needFlaskId`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getNeedByFlaskId(
    @Req() req: Request,
    @Param('needFlaskId') needFlaskId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.needService.getNeedByFlaskId(needFlaskId);
  }

  @Get(`relation/:needFlaskId`)
  @ApiOperation({ description: 'Get a need from db 2' })
  async getProviderNeedRelationById(
    @Req() req: Request,
    @Param('needFlaskId') needFlaskId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    return await this.providerService.getProviderNeedRelationById(needFlaskId);
  }

  @Get('flask/preneeds/templates')
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getPrNeed(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }
    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    const preNeeds = await this.needService.getFlaskPreNeed(token);

    return preNeeds;
  }

  @Get(`unconfirmed/:swId`)
  @ApiOperation({ description: 'Get all done needs from flask' })
  async getNotConfirmedNeeds(
    @Req() req: Request,
    @Param('swId') socialWorkerId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    const socialWorker = await this.userService.getFlaskSocialWorker(
      socialWorkerId,
    ); // sw ngo
    const unconfirmedCount = await this.needService.getNotConfirmedNeeds(
      socialWorkerId,
      null,
      [socialWorker.ngo_id],
    );
    return unconfirmedCount[1];
  }

  @Post(`confirm/mass`)
  @ApiOperation({ description: 'Confirm array of needs' })
  async massConfirmNeeds(
    @Req() req: Request,
    @Body() body: { needIds: number[] },
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
    try {
      if (body) {
        for await (const needId of body.needIds) {
          if (Number(needId) > 0) {
            const configs = {
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: token,
                processData: false,
                contentType: false,
              },
            };
            const { data } = await axios.patch(
              `https://api.sayapp.company/api/v2/need/confirm/needId=${needId}`,
              {},
              configs,
            );
          }
        }
        // to reset prepare
        config().dataCache.storeToBeConfirmed([], new Date());
      }
    } catch (e) {
      console.log(e);
      throw new ServerError(e.message);
    }
  }

  @Get(`confirm/prepare`)
  @ApiOperation({ description: 'Prepare confirm needs' })
  async prepareConfirmNeeds(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];

    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    // 0- Fetch only active SW + NGO
    const activeSwIds = await this.userService
      .getFlaskSwIds()
      .then((r) => r.filter((s) => s.is_active).map((s) => s.id));

    const ngoIds = await this.ngoService
      .getFlaskNgos()
      .then((r) => r.filter((n) => n.isActive).map((n) => n.id));

    let toBeConfirmed = config().dataCache.fetchToBeConfirmed();

    const expired =
      !toBeConfirmed ||
      !toBeConfirmed.list[0] ||
      !toBeConfirmed.createdAt ||
      timeDifference(toBeConfirmed.createdAt, new Date()).mm >= 5;
    console.log(`Mass prepare expired: ${expired}`);
    console.log(
      `Last prepare: ${
        toBeConfirmed.createdAt &&
        timeDifference(toBeConfirmed.createdAt, new Date()).mm
      } minutes ago`,
    );

    if (expired) {
      const notConfirmed = await this.needService.getNotConfirmedNeeds(
        null,
        activeSwIds,
        ngoIds,
      );
      const myList = [];
      let counter = 0;
      for await (const need of notConfirmed[0]) {
        counter += 1;
        console.log(
          `${counter} / ${notConfirmed[0].length} Mass Confirm preparation: ${need.id}`,
        );
        // 1- sync & validate need
        let fetchedNeed = await this.needService.getNeedByFlaskId(need.id);

        // Just in case
        const fetchedProviderRel =
          await this.providerService.getProviderNeedRelationById(need.id);
        if (
          !fetchedNeed ||
          !fetchedNeed.provider ||
          (fetchedProviderRel &&
            fetchedNeed.provider.id != fetchedProviderRel.nestProviderId) ||
          fetchedNeed.status !== need.status ||
          fetchedNeed.category !== need.category ||
          fetchedNeed.type !== need.type ||
          fetchedNeed.details !== need.details ||
          fetchedNeed.information !== need.informations ||
          fetchedNeed.nameTranslations.en !== need.name_translations.en
        ) {
          const { need: nestNeed } = await this.syncService.syncNeed(
            need,
            need.child_id,
            panelFlaskUserId,
            null,
            null,
            null,
          );
          fetchedNeed = nestNeed;
        }

        const superAdmin = await this.userService.getUserByFlaskId(
          SUPER_ADMIN_ID,
        );

        const validatedNeed = await validateNeed(fetchedNeed, superAdmin);
        let ticket: TicketEntity;
        let needTickets = await this.ticketService.getTicketsByNeed(
          validatedNeed.needId,
        );
        const ticketError = needTickets.find(
          (t) =>
            t.lastAnnouncement === AnnouncementEnum.ERROR ||
            t.color === Colors.RED,
        );
        // 0-  ticket if not a valid need and not ticketed yet
        if (!validatedNeed.isValidNeed) {
          // create ticket if already has not
          if (!ticketError) {
            console.log('\x1b[36m%s\x1b[0m', 'Creating Ticket Content ...\n');
            ticket = await this.ticketService.createTicket(
              validatedNeed.ticketDetails,
              validatedNeed.participants,
            );
            await this.ticketService.createTicketContent(
              {
                message: validatedNeed.message,
                from: superAdmin.flaskUserId,
                announcement: validatedNeed.ticketDetails.lastAnnouncement,
                color: validatedNeed.ticketDetails.color,
              },
              ticket,
            );
            // Disable notification for admin
            await this.ticketService.createTicketView(
              superAdmin.flaskUserId,
              ticket.id,
            );
          } else if (
            ticketError &&
            daysDifference(ticketError.createdAt, new Date()) > GRACE_PERIOD
          ) {
            // when we use panel we take care of this in the taskCard component
            console.log(
              '\x1b[36m%s\x1b[0m',
              'Need will be deleted from front-end...\n',
            );
          }
          needTickets = await this.ticketService.getTicketsByNeed(
            validatedNeed.needId,
          );
          ticket = needTickets.find(
            (t) => t.lastAnnouncement === AnnouncementEnum.ERROR,
          );
          myList.push({
            limit: null,
            validCount: null,
            need: fetchedNeed,
            duplicates: null,
            errorMsg: validatedNeed.message,
            possibleMissMatch: [],
            ticket,
          });
          console.log('\x1b[36m%s\x1b[0m', 'Skipping need...\n');
          continue;
        }
        /// -------------------------------- If Valid Need --------------------------------------------///
        if (ticketError) {
          // since it is a valid need with an old ticket, we need to update the ticket
          await this.ticketService.updateTicketAnnouncement(
            ticketError.id,
            AnnouncementEnum.NONE,
          );

          await this.ticketService.updateTicketColor(
            ticketError.id,
            Colors.BLUE,
          );
        }
        // 1- get duplicates for the child / same name-translations.en
        const duplicates = await this.needService.getDuplicateNeeds(
          need.child_id,
          need.id,
        );

        let validatedDups: ValidatedDupType[];
        if (duplicates && duplicates[0]) {
          validatedDups = duplicates.map((d) => {
            return {
              ...d,
              validation: checkNeed(need, d),
            };
          });
        }

        let errorMsg: string;
        // 2- compare to confirmed similar needs / names_translations
        // then if not many similar needs it should be checked manually
        const similarNameNeeds = await this.needService.getSimilarNeeds(
          need.name_translations.en,
        );
        const sameCatSimilarity = similarNameNeeds.filter(
          (n) => n.category === need.category,
        );
        const diffCatSimilarity = similarNameNeeds.filter(
          (n) => n.category !== need.category,
        );

        if (
          need.type === NeedTypeEnum.PRODUCT &&
          sameCatSimilarity.length < SIMILAR_NAME_LIMIT_PRODUCT
        ) {
          errorMsg = `Similar count error, only ${sameCatSimilarity.length}.`;
        }
        if (
          need.type === NeedTypeEnum.SERVICE &&
          sameCatSimilarity.length < SIMILAR_NAME_LIMIT_SERVICE
        ) {
          errorMsg = `Similar count error, only ${sameCatSimilarity.length}.`;
        }

        // 3- if we have a milk for sara, only two more needs from the same category. eg: cheese, butter,...
        // every category different limit
        let limit: number;
        if (need.category === CategoryEnum.GROWTH) {
          limit = BASE_LIMIT_DUPLICATES_0;
        }
        if (need.category === CategoryEnum.JOY) {
          limit = BASE_LIMIT_DUPLICATES_1;
        }
        if (need.category === CategoryEnum.HEALTH) {
          limit = BASE_LIMIT_DUPLICATES_2;
        }
        if (need.category === CategoryEnum.SURROUNDING) {
          limit = BASE_LIMIT_DUPLICATES_3;
        }
        const validCount =
          validatedDups &&
          validatedDups.filter((v) => v.validation.isValidDuplicate).length;

        if (validCount && limit < validCount) {
          errorMsg = `Limit error, ${limit}`;
        }
        if (
          validatedDups &&
          validatedDups.filter((v) => v.category !== fetchedNeed.category)
            .length > 0
        ) {
          errorMsg = `Category error, ${
            validatedDups.filter((v) => v.category !== fetchedNeed.category)
              .length
          }`;
        }
        myList.push({
          limit,
          validCount,
          need: fetchedNeed,
          duplicates: validatedDups,
          errorMsg,
          possibleMissMatch: diffCatSimilarity.map((n) => {
            return {
              needId: n.id,
              childId: n.child_id,
              status: n.status,
              category: n.category,
              type: n.type,
              isConfirmed: n.confirmDate && true,
            };
          }),
          ticket,
        });
      }

      config().dataCache.storeToBeConfirmed(myList, new Date());
    }
    toBeConfirmed = config().dataCache.fetchToBeConfirmed();

    return toBeConfirmed;
  }

  @Get('duplicates/:flaskChildId/:flaskNeedId')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async getDuplicateNeeds(
    @Req() req: Request,
    @Param('flaskChildId') flaskChildId: number,
    @Param('flaskNeedId') flaskNeedId: number,
  ) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (!isAuthenticated(panelFlaskUserId, panelFlaskTypeId)) {
      throw new ForbiddenException(401, 'You Are not authorized!');
    }

    return await this.needService.getDuplicateNeeds(flaskChildId, flaskNeedId);
  }

  @Get('delete/candidates')
  @ApiOperation({ description: 'Get old needs to delete if not paid.' })
  async deleteCandidates(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const deleteCandidates = await this.needService.getDeleteCandidates();

    return { list: deleteCandidates[0], total: deleteCandidates[1] };
  }

  @Get('update/candidates')
  @ApiOperation({ description: 'Get arrived needs to update them' })
  async updateArrivalsCandidates(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const updateCandidates =
      await this.needService.getArrivalUpdateCandidates();

    return { list: updateCandidates[0], total: updateCandidates[1] };
  }

  @Get('delete/old')
  @ApiOperation({ description: 'Get duplicates need for confirming' })
  async deleteOldNeeds(@Req() req: Request) {
    // delete old confirmed needs
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }
    const deleteCandidates = await this.needService.getDeleteCandidates();
    for await (const need of deleteCandidates[0]) {
      const daysDiff = daysDifference(need.confirmDate, new Date());
      if (daysDiff > 90) {
        const accessToken =
          config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;
        await this.needService.deleteFlaskOneNeed(need.id, accessToken);
      }
    }
    return { deleted: deleteCandidates[1] };
  }

  @Get('update/arrivals')
  async updateNeedsStatus(@Req() req: Request) {
    const panelFlaskUserId = req.headers['panelFlaskUserId'];
    const panelFlaskTypeId = req.headers['panelFlaskTypeId'];
    if (
      !isAuthenticated(panelFlaskUserId, panelFlaskTypeId) ||
      panelFlaskTypeId !== FlaskUserTypesEnum.SUPER_ADMIN ||
      panelFlaskUserId !== SUPER_ADMIN_ID
    ) {
      throw new ForbiddenException('You Are not the Super admin');
    }

    const needs = await this.needService.getArrivalUpdateCandidates();

    const token =
      config().dataCache.fetchPanelAuthentication(panelFlaskUserId).token;

    const configs = {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: token,
        processData: false,
        contentType: false,
      },
    };
    // Only for products: for service do a manual review for receipts
    for await (const need of needs[0]) {
      if (
        need.type === NeedTypeEnum.PRODUCT &&
        need.status === ProductStatusEnum.PURCHASED_PRODUCT
      ) {
        const ticket = await this.ticketService.getTicketByFlaskNeedId(need.id);

        try {
          if (
            ticket &&
            ticket.ticketHistories &&
            ticket.ticketHistories.find(
              (h) => h.announcement == AnnouncementEnum.ARRIVED_AT_NGO,
            )
          ) {
            const { data } = await axios.patch(
              `https://api.sayapp.company/api/v2/need/update/needId=${need.id}`,
              {
                status: ProductStatusEnum.DELIVERED_TO_NGO,
                ngo_delivery_date: String(
                  format(
                    new Date(
                      ticket.ticketHistories.find(
                        (h) =>
                          h.announcement == AnnouncementEnum.ARRIVED_AT_NGO,
                      ).announcedArrivalDate,
                    ),
                    'yyyy-MM-dd',
                  ),
                ),
              },
              configs,
            );

            if (data.status === ProductStatusEnum.DELIVERED_TO_NGO) {
              await this.ticketService.updateTicketColor(
                ticket.id,
                Colors.BLUE,
              );
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    }
  }
}
