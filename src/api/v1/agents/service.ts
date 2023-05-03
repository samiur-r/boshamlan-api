/* eslint-disable no-param-reassign */
import { In, LessThan, MoreThanOrEqual } from 'typeorm';
import { deleteMediaFromCloudinary } from '../../../utils/cloudinaryUtils';
import ErrorHandler from '../../../utils/ErrorHandler';
import logger from '../../../utils/logger';
import { alertOnSlack } from '../../../utils/slackUtils';
import { sendSms } from '../../../utils/smsUtils';

import { IUser } from '../users/interfaces';
import { User } from '../users/model';
import { AgentInfoType, IAgent } from './interfaces';
import { Agent } from './model';

const findManyAgents = async (limit: number, offset: number | undefined) => {
  let totalRows;
  const currentDate = new Date();
  const agents: IAgent[] | null = await Agent.find({
    where: { subscription_ends_date: MoreThanOrEqual(currentDate) },
    take: limit,
    skip: offset,
  });

  if (offset === 0) totalRows = await Agent.count();

  agents?.forEach((agent) => {
    agent.phone = agent.user?.phone;

    agent.socialLinks = [
      {
        image: '/images/facebook-filled.svg',
        href: `https://www.facebook.com/${agent.facebook}`,
      },
      {
        image: '/images/twitter-filled.svg',
        href: `https://www.twitter.com/${agent.twitter}`,
      },
      {
        image: '/images/instagram-filled.svg',
        href: `https://www.instagram.com/${agent.instagram}`,
      },
      {
        image: '/images/email-filled.svg',
        href: `mailto:${agent.email}`,
      },
    ];
    delete agent?.user;
  });

  return { agents, totalRows };
};

const findAgentByUserId = async (userId: number) => {
  const agent: IAgent | null = await Agent.findOne({ where: { user: { id: userId } } });
  delete agent?.user;

  return agent;
};

const findAgentById = async (id: number) => {
  const agent: IAgent | null = await Agent.findOneBy({ id });

  if (agent) {
    agent.phone = agent?.user?.phone;
    agent.user_id = agent?.user?.id;
  }

  delete agent?.user;

  return agent;
};

const updateAgent = async (agentInfo: any, userId: number) => {
  const agent = await findAgentByUserId(userId);

  if (!agent) throw new ErrorHandler(404, `agent doesn't exists`);

  if (agent.logo_url) {
    await deleteMediaFromCloudinary(agent.logo_url, 'agents');
  }

  const agentData = Agent.create({
    ...agent,
    ...agentInfo,
  });

  await Agent.save(agentData);
};

const initOrUpdateAgent = async (user: IUser, packageTitle: string) => {
  const agent = await findAgentByUserId(user.id);
  const today = new Date();
  // const twoMonthsFromToday = new Date(
  //   today.getFullYear(),
  //   today.getMonth() + 2,
  //   today.getDate(),
  //   today.getHours(),
  //   today.getMinutes(),
  //   today.getSeconds(),
  // );

  const oneDayFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 1,
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );

  const twoDaysFromToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + 2,
    today.getHours(),
    today.getMinutes(),
    today.getSeconds(),
  );

  today.setMinutes(Math.ceil(today.getMinutes() / 30) * 30);
  today.setSeconds(0);
  today.setMilliseconds(0);

  oneDayFromToday.setMinutes(Math.ceil(oneDayFromToday.getMinutes() / 30) * 30);
  oneDayFromToday.setSeconds(0);
  oneDayFromToday.setMilliseconds(0);

  twoDaysFromToday.setMinutes(Math.ceil(twoDaysFromToday.getMinutes() / 30) * 30);
  twoDaysFromToday.setSeconds(0);
  twoDaysFromToday.setMilliseconds(0);

  let agentData;

  if (agent) {
    agentData = Agent.create({
      ...agent,
      subscription_start_date: today,
      subscription_ends_date: packageTitle === 'agent1' ? oneDayFromToday : twoDaysFromToday,
    });
  } else {
    agentData = Agent.create({
      name: 'agent',
      subscription_start_date: today,
      subscription_ends_date: packageTitle === 'agent1' ? oneDayFromToday : twoDaysFromToday,
      user,
    });
  }

  await Agent.save(agentData);
};

const getExpiredAgentUserIds = async () => {
  const currentDate = new Date();
  const agents = await Agent.find({
    where: { subscription_ends_date: LessThan(currentDate) },
  });

  const userIds = agents.filter((agent) => agent.user.is_agent === true).map((agent) => agent.user.id);

  return userIds;
};

const fireAgentExpirationAlert = async (userIds: number[]) => {
  const users = await User.find({
    where: { id: In(userIds) },
  });

  // eslint-disable-next-line no-restricted-syntax
  for (const user of users) {
    const slackMsg = `Subscription ended.\n\n${
      user?.phone ? `User: <https://wa.me/965${user?.phone}|${user?.phone}>` : ''
    }`;

    try {
      // eslint-disable-next-line no-await-in-loop
      await alertOnSlack('imp', slackMsg);
      // eslint-disable-next-line no-await-in-loop
      await sendSms(user.phone, 'Your subscription ended');
    } catch (error) {
      logger.error(`${error.name}: ${error.message}`);
    }
  }
};

const setSubscriptionNull = async (userId: number) => {
  const agent = await findAgentByUserId(userId);
  if (!agent) return;

  const agentData = Agent.create({
    ...agent,
    // @ts-ignore
    subscription_start_date: null,
    subscription_ends_date: null,
  });

  await Agent.save(agentData);
};

export {
  initOrUpdateAgent,
  findAgentByUserId,
  updateAgent,
  getExpiredAgentUserIds,
  findManyAgents,
  findAgentById,
  fireAgentExpirationAlert,
  setSubscriptionNull,
};
