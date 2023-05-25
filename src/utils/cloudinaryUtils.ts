import streamifier from 'streamifier';

import cloudinary from '../config/cloudinary';
import ErrorHandler from './ErrorHandler';
import logger from './logger';

const uploadMediaToCloudinary = async (file: any, preset: string) => {
  type ResourceType = 'image' | 'video' | 'raw' | 'auto';

  const resourceType = 'auto';

  const options = {
    public_id: `${Date.now()}`,
    resource_type: resourceType as ResourceType,
    upload_preset: preset,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    // transformation: [
    //   {
    //     if: fileType === 'image' ? 'w_gt_620' : 'w_gt_500',
    //     width: fileType === 'image' ? 620 : 500,
    //     crop: 'scale',
    //   },
    //   { quality: 60 },
    // ],
  };

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result?.eager[0]?.secure_url);
      }
    });
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

const getAssetInfoFromCloudinary = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    return result;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

const getPublicId = (imageURL: string) => imageURL.split('/').pop()?.split('.')[0];

const deleteMediaFromCloudinary = async (imageURL: string, preset: string) => {
  try {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const public_id = getPublicId(imageURL);

    if (!public_id) throw new ErrorHandler(500, 'Something went wrong');

    const pathSegments = imageURL.split('/');
    const resourceType = pathSegments[4];

    const result = await cloudinary.uploader.destroy(`${preset}/${public_id}`, {
      invalidate: true,
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

export { uploadMediaToCloudinary, getAssetInfoFromCloudinary, deleteMediaFromCloudinary };
