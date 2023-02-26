/* eslint-disable no-param-reassign */
import dayJs from 'dayjs';
import * as path from 'path';
import { LessThan, MoreThanOrEqual } from 'typeorm';

import { deleteFile } from '../../../utils/deleteFile';
import ErrorHandler from '../../../utils/ErrorHandler';

import { IUser } from '../users/interfaces';
import { AgentInfoType, IAgent } from './interfaces';
import { Agent } from './model';

const findManyAgents = async (limit: number, offset: number | undefined) => {
  let totalRows;
  const currentDate = new Date();
  const agents: IAgent[] | null = await Agent.find({
    where: { expiry_date: MoreThanOrEqual(currentDate) },
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

const updateAgent = async (agentInfo: AgentInfoType, userId: number) => {
  const agent = await findAgentByUserId(userId);

  if (!agent) throw new ErrorHandler(404, `agent doesn't exists`);

  if (agent.logo_url) {
    const currentDirectory = __dirname;
    const filePath = path.resolve(currentDirectory, '../../../../../boshamlan-frontend/public/images/agents');
    deleteFile(`${filePath}/${agent.logo_url}`);
  }

  const agentData = Agent.create({
    ...agent,
    ...agentInfo,
  });

  await Agent.save(agentData);
};

const initOrUpdateAgent = async (user: IUser) => {
  const agent = await findAgentByUserId(user.id);

  let agentData;

  if (agent) {
    agentData = Agent.create({
      ...agent,
      expiry_date: dayJs().month(3),
    });
  } else {
    agentData = Agent.create({
      name: 'agent',
      expiry_date: dayJs().month(3),
      user,
    });
  }

  await Agent.save(agentData);
};

const getExpiredAgentUserIds = async () => {
  const agents = await Agent.find({
    where: { expiry_date: LessThan(new Date()) },
  });
  const userIds = agents.map((agent) => agent.user.id);
  return userIds;
};

export { initOrUpdateAgent, findAgentByUserId, updateAgent, getExpiredAgentUserIds, findManyAgents, findAgentById };
