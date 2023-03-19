import cloudinary from '../config/cloudinary';
import ErrorHandler from './ErrorHandler';
import logger from './logger';

const uploadMediaToCloudinary = async (mediaBase64str: string, preset: string) => {
  type ResourceType = 'image' | 'video' | 'raw' | 'auto';

  const resourceType = mediaBase64str.split('/')[0].split(':')[1];

  const options = {
    resource_type: resourceType as ResourceType,
    upload_preset: preset,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
    transformation: [
      {
        if: resourceType === 'image' ? 'w_gt_720' : 'w_gt_500',
        width: resourceType === 'image' ? 720 : 500,
        crop: 'scale',
      },
      { quality: 'auto' },
    ],
  };

  try {
    const result = await cloudinary.uploader.upload(mediaBase64str, options);
    return result.secure_url;
  } catch (error) {
    logger.error(error);
    return false;
  }
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
